import type { ConvexClient, ConvexHttpClient } from 'convex/browser';
import type { Redis } from '@upstash/redis';
import {
  api,
  GAME_STATUS,
  type DeckId,
  type UserId,
  type GameId,
  type GameStatus
} from '@game/api';
import { type GameOptions } from '@game/engine/src/game/game';
import type { RoomManager } from './room-manager';
import type { Nullable } from '@game/shared';
import { deleteGameKeys, REDIS_KEYS, REDIS_TTL_SECONDS } from './redis';

type GameDto = {
  id: GameId;
  status: GameStatus;
  players: Array<{ userId: UserId; deckId: DeckId }>;
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

  // (game, status) pairs that were successfully handled, convex can deliver the same game several times
  private handled = new Set<string>();

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

  private listenToGamesByStatus(
    status: GameStatus,
    cb: (game: GameDto) => Promise<void>
  ) {
    this.ctx.convexClient.onUpdate(
      api.games.latest,
      { status },
      ({ game }) => {
        if (!game) return;

        return this.enqueue(game.id, async () => {
          const handledKey = `${game.id}:${status}`;
          if (this.handled.has(handledKey)) return;

          await cb(game);
          this.handled.add(handledKey);
        });
      },
      err => {
        console.error(`[GAMES MANAGER] Subscription error (${status})`, err);
      }
    );
  }

  init() {
    console.log('[GAMES MANAGER] Listening to game events');
    this.listenToGamesByStatus(
      GAME_STATUS.WAITING_FOR_PLAYERS,
      this.onGameCreated.bind(this)
    );
    this.listenToGamesByStatus(GAME_STATUS.ONGOING, this.onGameReady.bind(this));
    this.listenToGamesByStatus(GAME_STATUS.FINISHED, this.onGameFinished.bind(this));
    this.listenToGamesByStatus(GAME_STATUS.CANCELLED, this.onGameCancelled.bind(this));
  }

  private async onGameCreated(game: GameDto) {
    console.log('[GAMES MANAGER] Game created', game.id);
    const redisStateResult = await this.setupRedisState(game.id);
    if (redisStateResult.cancelled) return;
    await this.createRoom(game);
  }

  private async onGameReady(game: GameDto) {
    console.log('[GAMES MANAGER] Game ready', game.id);
    const redisStateResult = await this.setupRedisState(game.id);
    if (redisStateResult.cancelled) return;

    const createRoomResult = await this.createRoom(game);
    if (createRoomResult.cancelled) return;

    const room = this.ctx.roomManager.getRoom(game.id);
    await room?.start();
    room?.updateStatus(GAME_STATUS.ONGOING);
  }

  private async onGameFinished(game: GameDto) {
    console.log('[GAMES MANAGER] Game finished', game.id);
    await this.ctx.roomManager.destroyRoom(game.id);
    await this.cleanupRedisState(game.id);
    this.updateRoomStatusIfExists(game.id, game.status);

    // @TODO generate game replay from engine snapshots and upload to convex
  }

  private async onGameCancelled(game: GameDto) {
    console.log('[GAMES MANAGER] Game cancelled', game.id);
    await this.ctx.roomManager.destroyRoom(game.id);
    await this.cleanupRedisState(game.id);
  }

  private async cleanupRedisState(gameId: GameId) {
    await deleteGameKeys(this.ctx.redis, gameId);
  }

  private async setupRedisState(gameId: GameId) {
    const existingState = await this.ctx.redis.json.get(REDIS_KEYS.GAME_STATE(gameId));
    if (existingState) return { cancelled: false };

    const initialState = await this.buildInitialState(gameId);
    if (!initialState) {
      console.log('No initial state, cancelling game', gameId);
      await this.cancelGame(gameId);
      return { cancelled: true };
    }

    await this.ctx.redis
      .pipeline()
      .json.set(REDIS_KEYS.GAME_STATE(gameId), '$', initialState, { nx: true })
      .expire(REDIS_KEYS.GAME_STATE(gameId), REDIS_TTL_SECONDS)
      .exec();

    return { cancelled: false };
  }

  // returns false if the game had to be cancelled
  private async createRoom(game: GameDto) {
    if (this.ctx.roomManager.hasRoom(game.id)) {
      console.log('Room already exists for game', game.id);
      return { cancelled: false };
    }

    const gameOptions = await this.buildGameOptions(game.id);
    if (!gameOptions) {
      console.log('No game options, cancelling game', game.id);
      await this.cancelGame(game.id);
      return { cancelled: true };
    }

    const gameInfos = await this.ctx.convexHttpClient.query(api.games.infosById, {
      gameId: game.id
    });

    await this.ctx.roomManager.createRoom(game.id, {
      initialState: gameOptions!,
      game: {
        id: game.id,
        status: game.status,
        players: game.players.map(p => ({ userId: p.userId })),
        options: gameInfos.options
      }
    });
    return { cancelled: false };
  }

  private async buildGameOptions(gameId: GameId) {
    let state: Nullable<GameOptions> = await this.ctx.redis.json.get<GameOptions>(
      REDIS_KEYS.GAME_STATE(gameId)
    );
    if (!state) {
      state = await this.buildInitialState(gameId);
    }

    return state;
  }

  private async buildInitialState(id: GameId): Promise<GameOptions | null> {
    const gameInfos = await this.ctx.convexHttpClient.query(api.games.infosById, {
      gameId: id
    });
    if (!gameInfos) return null;

    const initialState: GameOptions = {
      id,
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
    return initialState;
  }

  private async cancelGame(gameId: GameId) {
    console.log('cancellign game', gameId);
    await this.ctx.convexHttpClient.mutation(api.games.cancel, {
      gameId,
      apiKey: process.env.CONVEX_API_KEY!
    });
    await this.ctx.roomManager.destroyRoom(gameId);
    await this.cleanupRedisState(gameId);
  }

  updateRoomStatusIfExists(gameId: GameId, status: GameStatus) {
    const room = this.ctx.roomManager.getRoom(gameId);
    if (room) {
      room.updateStatus(status);
    }
  }
}
