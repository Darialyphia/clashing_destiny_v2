import type { Id } from '../../_generated/dataModel';
import type { DatabaseReader, DatabaseWriter } from '../../_generated/server';
import { type DeckId } from '../../deck/entities/deck.entity';
import { UserRepository } from '../../users/repositories/user.repository';
import { DomainError } from '../../utils/error';
import { GamePlayer, type GamePlayerDoc } from '../entities/gamePlayer.entity';
import { type GameId } from '../entities/game.entity';
import { type UserId } from '../../users/entities/user.entity';

export class GamePlayerReadRepository {
  constructor(protected db: DatabaseReader) {}

  async getById(gamePlayerId: Id<'gamePlayers'>) {
    return this.db.get(gamePlayerId);
  }

  async byUserId(userId: Id<'users'>) {
    return this.db
      .query('gamePlayers')
      .withIndex('by_user_id', q => q.eq('userId', userId))
      .unique();
  }

  async byGameId(gameId: Id<'games'>) {
    return this.db
      .query('gamePlayers')
      .withIndex('by_game_id', q => q.eq('gameId', gameId))
      .collect();
  }
}

export class GamePlayerRepository {
  declare protected db: DatabaseWriter;
  declare protected userRepo: UserRepository;

  constructor(config: { db: DatabaseWriter; userRepo: UserRepository }) {
    this.db = config.db;
    this.userRepo = config.userRepo;
  }

  private async buildEntity(doc: GamePlayerDoc) {
    const userDoc = await this.userRepo.getById(doc.userId);

    if (!userDoc) throw new DomainError('User not found');

    return new GamePlayer(doc._id, { ...doc, name: userDoc.name });
  }

  async getById(gamePlayerId: Id<'gamePlayers'>) {
    const doc = await this.db.get(gamePlayerId);

    if (!doc) return null;

    return this.buildEntity(doc);
  }

  async byUserId(userId: Id<'users'>) {
    const doc = await this.db
      .query('gamePlayers')
      .withIndex('by_user_id', q => q.eq('userId', userId))
      .unique();

    if (!doc) throw null;

    return this.buildEntity(doc);
  }

  async byGameId(gameId: Id<'games'>) {
    const docs = await this.db
      .query('gamePlayers')
      .withIndex('by_game_id', q => q.eq('gameId', gameId))
      .collect();

    return Promise.all(docs.map(doc => this.buildEntity(doc)));
  }

  create(data: { deckId: DeckId; userId: UserId; gameId: GameId }) {
    return this.db.insert('gamePlayers', data);
  }

  async save(gamePlayer: GamePlayer) {
    await this.db.replace(gamePlayer.id, {
      gameId: gamePlayer.gameId,
      userId: gamePlayer.userId,
      deckId: gamePlayer.deckId
    });
  }
}
