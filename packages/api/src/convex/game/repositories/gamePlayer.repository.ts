import type { Id } from '../../_generated/dataModel';
import type { DatabaseReader, DatabaseWriter } from '../../_generated/server';
import { type DeckId } from '../../deck/entities/deck.entity';
import { DomainError } from '../../utils/error';
import { GamePlayer, type GamePlayerDoc } from '../entities/gamePlayer.entity';
import { type GameId } from '../entities/game.entity';
import { type UserId } from '../../users/entities/user.entity';
import type { UserRepository } from '../../users/repositories/user.repository';
import type { GamePlayerMapper } from '../mappers/gamePlayer.mapper';

export class GamePlayerReadRepository {
  static INJECTION_KEY = 'gamePlayerReadRepo' as const;

  constructor(private ctx: { db: DatabaseReader }) {}
  async getById(gamePlayerId: Id<'gamePlayers'>) {
    return this.ctx.db.get(gamePlayerId);
  }

  async byUserId(userId: Id<'users'>) {
    return this.ctx.db
      .query('gamePlayers')
      .withIndex('by_creation_time')
      .filter(q => q.eq(q.field('userId'), userId))
      .order('desc')
      .first();
  }

  async byGameId(gameId: Id<'games'>) {
    return this.ctx.db
      .query('gamePlayers')
      .withIndex('by_game_id', q => q.eq('gameId', gameId))
      .collect();
  }
}

export class GamePlayerRepository {
  static INJECTION_KEY = 'gamePlayerRepo' as const;

  constructor(
    private ctx: {
      db: DatabaseWriter;
      userRepo: UserRepository;
      gamePlayerMapper: GamePlayerMapper;
    }
  ) {}

  private async buildEntity(doc: GamePlayerDoc) {
    const userDoc = await this.ctx.userRepo.getById(doc.userId);

    if (!userDoc) throw new DomainError('User not found');

    return new GamePlayer(doc._id, { ...doc, username: userDoc.username.value });
  }

  async getById(gamePlayerId: Id<'gamePlayers'>) {
    const doc = await this.ctx.db.get(gamePlayerId);

    if (!doc) return null;

    return this.buildEntity(doc);
  }

  async byUserId(userId: Id<'users'>) {
    const doc = await this.ctx.db
      .query('gamePlayers')
      .withIndex('by_creation_time')
      .filter(q => q.eq(q.field('userId'), userId))
      .order('desc')
      .first();
    if (!doc) return null;

    return this.buildEntity(doc);
  }

  async byGameId(gameId: Id<'games'>) {
    const docs = await this.ctx.db
      .query('gamePlayers')
      .withIndex('by_game_id', q => q.eq('gameId', gameId))
      .collect();

    return Promise.all(docs.map(doc => this.buildEntity(doc)));
  }

  async create(data: { deckId: DeckId; userId: UserId; gameId: GameId }) {
    const gameId = await this.ctx.db.insert('gamePlayers', data);

    return gameId;
  }

  async save(gamePlayer: GamePlayer) {
    await this.ctx.db.replace(
      gamePlayer.id,
      this.ctx.gamePlayerMapper.toPersistence(gamePlayer)
    );
  }
}
