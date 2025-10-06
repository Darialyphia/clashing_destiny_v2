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

const REDIS_KEYS = {
  GAME_PRESENCE: (gameId: GameId) => `game:presence:${gameId}`,
  GAME_STATE: (gameId: GameId) => `game:state:${gameId}`
};

type PersistedGameState = {
  initialState: GameOptions;
  history: SerializedInput[];
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
  ) {
    this.startListeningForGames();
  }

  private startListeningForGames() {
    this.ctx.convexClient.onUpdate(
      api.games.latest,
      { status: GAME_STATUS.WAITING_FOR_PLAYERS },
      async ({ games }) => {
        await Promise.all(games.map(game => this.onGameCreated(game)));
      }
    );

    this.ctx.convexClient.onUpdate(
      api.games.latest,
      { status: GAME_STATUS.ONGOING },
      async ({ games }) => {
        await Promise.all(games.map(game => this.onGameReady(game)));
      }
    );

    this.ctx.convexClient.onUpdate(
      api.games.latest,
      { status: GAME_STATUS.FINISHED },
      ({ games }) => {
        games.forEach(game => {
          this.onGameFinished(game);
        });
      }
    );

    this.ctx.convexClient.onUpdate(
      api.games.latest,
      { status: GAME_STATUS.CANCELLED },
      async ({ games }) => {
        await Promise.all(games.map(game => this.onGameCancelled(game)));
      }
    );
  }

  private async onGameCreated(game: GameDto) {
    const existingState = await this.ctx.redis.get(REDIS_KEYS.GAME_STATE(game.id));
    if (existingState) return;

    const initialState = await this.buildInitialState(game.id);
    if (!initialState) return this.cancelGame(game.id);

    await this.ctx.redis.set(REDIS_KEYS.GAME_STATE(game.id), {
      initialState,
      history: []
    });

    const gameOptions = await this.buildGameOptions(game.id);
    this.ctx.roomManager.createRoom(game.id, {
      initialState: gameOptions!,
      game: {
        id: game.id,
        status: game.status,
        players: game.players.map(p => ({ userId: p.userId }))
      }
    });
  }

  private async onGameReady(dto: GameDto) {
    const room = this.ctx.roomManager.getRoom(dto.id);
    if (!room) {
      // @TODO handle missing room (case where server was down when game was created)
      return;
    }

    await room.start();
  }

  private onGameFinished(game: GameDto) {
    // @TODO generate game replay from engine snapshots and upload to convex
  }

  private async onGameCancelled(game: GameDto) {
    await this.ctx.redis.del(REDIS_KEYS.GAME_PRESENCE(game.id));
    await this.ctx.redis.del(REDIS_KEYS.GAME_STATE(game.id));
  }

  private async buildGameOptions(gameId: GameId) {
    let state: GameOptions | null = null;
    const persistedState = await this.ctx.redis.get<string>(
      REDIS_KEYS.GAME_STATE(gameId)
    );
    if (!persistedState) {
      state = await this.buildInitialState(gameId);
    } else {
      state = (JSON.parse(persistedState) as PersistedGameState).initialState; // @TODO probably should use zod instead
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
  }
}
