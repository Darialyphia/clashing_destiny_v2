import { internal } from '../../_generated/api';
import type { DatabaseReader, DatabaseWriter } from '../../_generated/server';
import type { Scheduler } from 'convex/server';
import type { DeckId } from '../../deck/entities/deck.entity';
import type { UserId } from '../../users/entities/user.entity';
import { Game, type GameDoc, type GameId } from '../entities/game.entity';
import { GAME_STATUS, GAME_TIMEOUT_MS, type GameStatus } from '../game.constants';
import type { GameMapper } from '../mappers/game.mapper';
import type {
  GamePlayerReadRepository,
  GamePlayerRepository
} from './gamePlayer.repository';

export class GameReadRepository {
  static INJECTION_KEY = 'gameReadRepo' as const;

  constructor(
    private ctx: { db: DatabaseReader; gamePlayerReadRepo: GamePlayerReadRepository }
  ) {}

  async getById(gameId: GameId) {
    return this.ctx.db.get(gameId);
  }

  async getByUserId(userId: UserId) {
    const gamePlayer = await this.ctx.db
      .query('gamePlayers')
      .withIndex('by_creation_time')
      .filter(q => q.eq(q.field('userId'), userId))
      .order('desc')
      .first();

    if (!gamePlayer) return null;

    return this.ctx.db.get(gamePlayer.gameId);
  }

  async getByUserIdAndStatus(userId: UserId, status: GameStatus) {
    const gamePlayer = await this.ctx.gamePlayerReadRepo.byUserId(userId);

    if (!gamePlayer) return null;

    const game = await this.ctx.db.get(gamePlayer.gameId);

    if (!game || game.status !== status) return null;

    return game;
  }

  async getLatestByStatus(status: GameStatus) {
    return this.ctx.db
      .query('games')
      .withIndex('by_status', q => q.eq('status', status))
      .take(1);
  }
}

export class GameRepository {
  static INJECTION_KEY = 'gameRepo' as const;

  constructor(
    private ctx: {
      db: DatabaseWriter;
      gamePlayerRepo: GamePlayerRepository;
      gameMapper: GameMapper;
      scheduler: Scheduler;
    }
  ) {}

  private async buildEntity(doc: GameDoc) {
    const players = await this.ctx.gamePlayerRepo.byGameId(doc._id);

    return new Game(doc._id, { game: doc, players });
  }

  async getById(gameId: GameId) {
    const doc = await this.ctx.db.get(gameId);

    if (!doc) return null;

    return this.buildEntity(doc);
  }

  async byUserId(userId: UserId) {
    const gamePlayer = await this.ctx.gamePlayerRepo.byUserId(userId);

    if (!gamePlayer) return null;

    const gameDoc = await this.ctx.db.get(gamePlayer.gameId);
    if (!gameDoc) return null;

    return this.buildEntity(gameDoc);
  }

  async byUserIdAndStatus(userId: UserId, status: GameStatus) {
    const gamePlayer = await this.ctx.gamePlayerRepo.byUserId(userId);

    if (!gamePlayer) return null;

    const gameDoc = await this.ctx.db.get(gamePlayer.gameId);
    if (!gameDoc || gameDoc.status !== status) return null;

    return this.buildEntity(gameDoc);
  }

  async create(
    players: Array<{ userId: UserId; deckId: DeckId }>,
    options: GameDoc['options']
  ) {
    const gameId = await this.ctx.db.insert('games', {
      seed: `${Date.now()}`,
      status: GAME_STATUS.WAITING_FOR_PLAYERS,
      options
    });

    for (const player of players) {
      await this.ctx.gamePlayerRepo.create({
        deckId: player.deckId,
        userId: player.userId,
        gameId: gameId
      });
    }

    const game = await this.getById(gameId);

    return game!;
  }

  async save(game: Game) {
    await this.ctx.db.patch(game.id, this.ctx.gameMapper.toPersistence(game));
  }

  async scheduleCancellation(game: Game) {
    const cancellationId = await this.ctx.scheduler.runAfter(
      GAME_TIMEOUT_MS,
      internal.games.internalCancel,
      { gameId: game.id }
    );

    game.scheduleCancellation(cancellationId);
  }
}
