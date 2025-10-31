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
import { REDIS_KEYS } from './redis';
import type { SpellSchool } from '@game/engine/src/card/card.enums';

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
    await this.setupRedisState(game.id);
    await this.createRoom(game);
  }

  private async onGameReady(game: GameDto) {
    console.log('[GAMES MANAGER] Game ready', game.id);
    await this.setupRedisState(game.id);
    await this.createRoom(game);

    const room = this.ctx.roomManager.getRoom(game.id);
    console.log('should start game', game.id);
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
    await this.cleanupRedisState(game.id);
    await this.ctx.roomManager.destroyRoom(game.id);
  }

  private async cleanupRedisState(gameId: GameId) {
    await this.ctx.redis.json.del(REDIS_KEYS.GAME_STATE(gameId));
    await this.ctx.redis.json.del(REDIS_KEYS.GAME_HISTORY(gameId));
  }

  private async setupRedisState(gameId: GameId) {
    const existingState = await this.ctx.redis.json.get(REDIS_KEYS.GAME_STATE(gameId));
    if (existingState) return;

    const initialState = await this.buildInitialState(gameId);
    if (!initialState) {
      console.log('No initial state, cancelling game', gameId);
      return this.cancelGame(gameId);
    }

    await this.ctx.redis.json.set(REDIS_KEYS.GAME_STATE(gameId), '$', initialState);
  }

  private async createRoom(game: GameDto) {
    const gameOptions = await this.buildGameOptions(game.id);
    if (!gameOptions) {
      console.log('No game options, cancelling game', game.id);
      return this.cancelGame(game.id);
    }
    if (this.ctx.roomManager.hasRoom(game.id)) {
      console.log('Room already exists for game', game.id);
      return;
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
          id: gameInfos.players[0].user.id,
          name: gameInfos.players[0].user.username,
          spellSchools: gameInfos.players[0].user.deck.spellSchools as SpellSchool[],
          mainDeck: {
            cards: gameInfos.players[0].user.deck.mainDeck.map(c => c.blueprintId)
          },
          destinyDeck: {
            cards: gameInfos.players[0].user.deck.destinyDeck.map(c => c.blueprintId)
          }
        },
        {
          id: gameInfos.players[1].user.id,
          name: gameInfos.players[1].user.username,
          spellSchools: gameInfos.players[1].user.deck.spellSchools as SpellSchool[],
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
    console.log('cancellign game', gameId);
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
