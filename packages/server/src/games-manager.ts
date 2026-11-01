import type { ConvexClient, ConvexHttpClient } from 'convex/browser';
import type { Redis } from '@upstash/redis';
import {
  api,
  GAME_STATUS,
  type GameId,
  type GameInfos,
  type GameStatus
} from '@game/api';
import { type GameOptions } from '@game/engine/src/game/game';
import type { RoomManager } from './room-manager';
import { deleteGameKeys, REDIS_KEYS, REDIS_TTL_SECONDS } from './redis';

type LiveGame = {
  id: GameId;
  status: GameStatus;
};

export class GamesManager {
  static INJECTION_KEY = 'gamesManager' as const;

  constructor(
    private ctx: {
      convexClient: ConvexClient;
      convexHttpClient: ConvexHttpClient;
      redis: Redis;
      roomManager: RoomManager;
    }
  ) {}

  // handlers of a same game are chained so they never run concurrently
  private queues = new Map<GameId, Promise<void>>();

  // live games this server has, or is setting up, a room for
  private trackedGames = new Set<GameId>();

  // convex pushes the whole live games list on every change, unchanged games are skipped
  private syncedStatuses = new Map<GameId, GameStatus>();

  private enqueue(gameId: GameId, task: () => Promise<void>) {
    const previous = this.queues.get(gameId) ?? Promise.resolve();
    const next = previous.then(task).catch(err => {
      console.error('[GAMES MANAGER] Failed to handle game', gameId, err);
    });
    this.queues.set(gameId, next);
    void next.then(() => {
      if (this.queues.get(gameId) === next) {
        this.queues.delete(gameId);
      }
    });
    return next;
  }

  // resolves once the games that were live when the server started have their room back
  init() {
    console.log('[GAMES MANAGER] Listening to live games');
    return new Promise<void>((resolve, reject) => {
      this.ctx.convexClient.onUpdate(
        api.games.live,
        {},
        async ({ games }) => {
          await this.reconcile(games);
          resolve();
        },
        err => {
          console.error('[GAMES MANAGER] Subscription error', err);
          // no-op once the first update went through
          reject(err);
        }
      );
    });
  }

  private reconcile(games: LiveGame[]) {
    const liveIds = new Set(games.map(game => game.id));
    // games leave the live list once they are finished or cancelled
    const endedIds = [...this.trackedGames].filter(id => !liveIds.has(id));

    games.forEach(game => this.trackedGames.add(game.id));
    endedIds.forEach(id => this.trackedGames.delete(id));

    return Promise.all([
      ...games.map(game => this.enqueue(game.id, () => this.syncGame(game))),
      ...endedIds.map(id => this.enqueue(id, () => this.teardownGame(id)))
    ]);
  }

  private async syncGame(game: LiveGame) {
    if (this.syncedStatuses.get(game.id) === game.status) return;
    console.log('[GAMES MANAGER] Syncing game', game.id, game.status);

    const room = await this.ensureRoom(game);

    switch (game.status) {
      case GAME_STATUS.INITIALIZING:
        // players join as soon as convex says so, the room must already accept them by then
        room.updateStatus(GAME_STATUS.WAITING_FOR_PLAYERS);
        await this.ctx.convexHttpClient.mutation(api.games.markReady, {
          gameId: game.id,
          apiKey: process.env.CONVEX_API_KEY!
        });
        break;
      case GAME_STATUS.WAITING_FOR_PLAYERS:
        room.updateStatus(GAME_STATUS.WAITING_FOR_PLAYERS);
        break;
      case GAME_STATUS.ONGOING:
        await room.start();
        room.updateStatus(GAME_STATUS.ONGOING);
        break;
    }

    this.syncedStatuses.set(game.id, game.status);
  }

  private async teardownGame(gameId: GameId) {
    console.log('[GAMES MANAGER] Game ended', gameId);
    await this.ctx.roomManager.destroyRoom(gameId);
    await deleteGameKeys(this.ctx.redis, gameId);
    this.syncedStatuses.delete(gameId);
  }

  private async ensureRoom(game: LiveGame) {
    const existingRoom = this.ctx.roomManager.getRoom(game.id);
    if (existingRoom) return existingRoom;

    const gameInfos = await this.ctx.convexHttpClient.query(api.games.infosById, {
      gameId: game.id
    });

    return this.ctx.roomManager.createRoom(game.id, {
      initialState: await this.ensureInitialState(gameInfos),
      game: {
        id: game.id,
        status: game.status,
        players: gameInfos.players.map(p => ({ userId: p.user.id })),
        options: gameInfos.options
      }
    });
  }

  private async ensureInitialState(gameInfos: GameInfos) {
    const key = REDIS_KEYS.GAME_STATE(gameInfos.id);
    const existingState = await this.ctx.redis.json.get<GameOptions>(key);
    if (existingState) return existingState;

    const initialState = this.buildInitialState(gameInfos);
    await this.ctx.redis
      .pipeline()
      .json.set(key, '$', initialState, { nx: true })
      .expire(key, REDIS_TTL_SECONDS)
      .exec();

    return initialState;
  }

  private buildInitialState(gameInfos: GameInfos): GameOptions {
    return {
      id: gameInfos.id,
      enableSnapshots: true,
      rngSeed: gameInfos.seed,
      overrides: {},
      players: [
        {
          id: gameInfos.players[0].user.id,
          name: gameInfos.players[0].user.username,
          deck: {
            cards: gameInfos.players[0].user.deck.cards.map(c => ({
              blueprintId: c.blueprintId,
              isFoil: c.isFoil
            }))
          }
        },
        {
          id: gameInfos.players[1].user.id,
          name: gameInfos.players[1].user.username,
          deck: {
            cards: gameInfos.players[1].user.deck.cards.map(c => ({
              blueprintId: c.blueprintId,
              isFoil: c.isFoil
            }))
          }
        }
      ]
    };
  }
}
