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
import type { SerializedInput } from '@game/engine/src/input/input-system';
import type { RoomManager } from './room-manager';
import type { Nullable } from '@game/shared';

const REDIS_KEYS = {
  GAME_STATE: (gameId: GameId) => `game:state:${gameId}`,
  GAME_HISTORY: (gameId: GameId) => `game:history:${gameId}`
};

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

  private listenToGamesByStatus(
    status: GameStatus,
    cb: (game: GameDto) => Promise<void>
  ) {
    this.ctx.convexClient.onUpdate(api.games.latest, { status }, async ({ games }) => {
      await Promise.all(games.map(game => cb(game)));
    });
  }

  listen() {
    this.listenToGamesByStatus(
      GAME_STATUS.WAITING_FOR_PLAYERS,
      this.onGameCreated.bind(this)
    );
    this.listenToGamesByStatus(GAME_STATUS.ONGOING, this.onGameReady.bind(this));
    this.listenToGamesByStatus(GAME_STATUS.FINISHED, this.onGameFinished.bind(this));
    this.listenToGamesByStatus(GAME_STATUS.CANCELLED, this.onGameCancelled.bind(this));
  }

  private async onGameCreated(game: GameDto) {
    await this.setupRedisState(game.id);
    await this.createRoom(game);
  }

  private async onGameReady(game: GameDto) {
    const room = this.ctx.roomManager.getRoom(game.id);
    // @TODO handle missing room (case where server was down when game was created)
    if (!room) return this.cancelGame(game.id);
    this.updateRoomStatusIfExists(game.id, game.status);
    await room.start();
  }

  private async onGameFinished(game: GameDto) {
    await this.ctx.roomManager.destroyRoom(game.id);
    await this.cleanupRedisState(game.id);
    this.updateRoomStatusIfExists(game.id, game.status);

    // @TODO generate game replay from engine snapshots and upload to convex
  }

  private async onGameCancelled(game: GameDto) {
    await this.cleanupRedisState(game.id);
    await this.ctx.roomManager.destroyRoom(game.id);
  }

  private async cleanupRedisState(gameId: GameId) {
    await this.ctx.redis.del(REDIS_KEYS.GAME_STATE(gameId));
  }

  private async setupRedisState(gameId: GameId) {
    const existingState = await this.ctx.redis.get(REDIS_KEYS.GAME_STATE(gameId));
    if (!existingState) {
      const initialState = await this.buildInitialState(gameId);
      if (!initialState) return this.cancelGame(gameId);

      await this.ctx.redis.json.set(REDIS_KEYS.GAME_STATE(gameId), '$', initialState);
    }
  }

  private async createRoom(game: GameDto) {
    const gameOptions = await this.buildGameOptions(game.id);
    if (!gameOptions) return this.cancelGame(game.id);
    if (!this.ctx.roomManager.hasRoom(game.id) && gameOptions) {
      this.ctx.roomManager.createRoom(game.id, {
        initialState: gameOptions!,
        game: {
          id: game.id,
          status: game.status,
          players: game.players.map(p => ({ userId: p.userId }))
        }
      });
    }
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
      rngSeed: gameInfos.seed,
      overrides: {},
      players: [
        {
          id: gameInfos.players[0].id,
          name: gameInfos.players[0].user.username,
          mainDeck: {
            cards: gameInfos.players[0].user.deck.mainDeck.map(c => c.blueprintId)
          },
          destinyDeck: {
            cards: gameInfos.players[0].user.deck.destinyDeck.map(c => c.blueprintId)
          }
        },
        {
          id: gameInfos.players[1].id,
          name: gameInfos.players[1].user.username,
          mainDeck: {
            cards: gameInfos.players[1].user.deck.mainDeck.map(c => c.blueprintId)
          },
          destinyDeck: {
            cards: gameInfos.players[1].user.deck.destinyDeck.map(c => c.blueprintId)
          }
        }
      ]
    };
    return initialState;
  }

  private async cancelGame(gameId: GameId) {
    await this.ctx.convexHttpClient.mutation(api.games.cancel, {
      gameId,
      apiKey: process.env.CONVEX_API_KEY!
    });
    await this.ctx.roomManager.destroyRoom(gameId);
  }

  updateRoomStatusIfExists(gameId: GameId, status: GameStatus) {
    const room = this.ctx.roomManager.getRoom(gameId);
    if (room) {
      room.updateStatus(status);
    }
  }
}
