import type { Id } from '../../_generated/dataModel';
import type { DatabaseReader, DatabaseWriter } from '../../_generated/server';
import type { UserRepository } from '../../users/repositories/user.repository';
import { DomainError } from '../../utils/error';
import {
  MatchmakingUser,
  type MatchmakingUserDoc,
  type MatchmakingUserId
} from '../entities/matchmakingUser.entity';

export class MatchmakingUserReadRepository {
  static INJECTION_KEY = 'matchmakingUserReadRepo' as const;

  constructor(private ctx: { db: DatabaseReader }) {}

  async getById(matchmakingId: Id<'matchmakingUsers'>) {
    return this.ctx.db.get(matchmakingId);
  }

  async getByMatchmakingId(matchmakingId: Id<'matchmaking'>) {
    return this.ctx.db
      .query('matchmakingUsers')
      .withIndex('by_matchmakingId', q => q.eq('matchmakingId', matchmakingId))
      .collect();
  }

  async getByUserId(userId: Id<'users'>) {
    return this.ctx.db
      .query('matchmakingUsers')
      .withIndex('by_userId', q => q.eq('userId', userId))
      .unique();
  }
}

export class MatchmakingUserRepository {
  static INJECTION_KEY = 'matchmakingUserRepo' as const;

  constructor(private ctx: { db: DatabaseWriter; userRepo: UserRepository }) {}

  private async buildEntity(doc: MatchmakingUserDoc) {
    const userDoc = await this.ctx.userRepo.getById(doc.userId);

    if (!userDoc) throw new DomainError('User not found');

    return new MatchmakingUser(doc._id, { ...doc, mmr: userDoc.mmr });
  }

  async getById(matchmakingId: Id<'matchmakingUsers'>) {
    const doc = await this.ctx.db.get(matchmakingId);

    if (!doc) return null;

    return this.buildEntity(doc);
  }

  async getByMatchmakingId(matchmakingId: Id<'matchmaking'>) {
    const docs = await this.ctx.db
      .query('matchmakingUsers')
      .withIndex('by_matchmakingId', q => q.eq('matchmakingId', matchmakingId))
      .collect();

    return Promise.all(docs.map(doc => this.buildEntity(doc)));
  }

  async byUserId(userId: Id<'users'>) {
    const doc = await this.ctx.db
      .query('matchmakingUsers')
      .withIndex('by_userId', q => q.eq('userId', userId))
      .unique();

    if (!doc) return null;

    return this.buildEntity(doc);
  }

  async create({
    matchmakingId,
    userId,
    deckId,
    mmr
  }: {
    matchmakingId: Id<'matchmaking'>;
    userId: Id<'users'>;
    deckId: Id<'decks'>;
    mmr: number;
  }) {
    const id = await this.ctx.db.insert('matchmakingUsers', {
      matchmakingId,
      userId,
      deckId,
      mmr,
      joinedAt: Date.now()
    });

    const matchmakingUser = await this.getById(id);
    return matchmakingUser!;
  }

  delete(id: MatchmakingUserId) {
    return this.ctx.db.delete(id);
  }

  async save(matchmakingUser: MatchmakingUser) {
    await this.ctx.db.replace(matchmakingUser.id, {
      matchmakingId: matchmakingUser.matchmakingId,
      userId: matchmakingUser.userId,
      deckId: matchmakingUser.deckId,
      mmr: matchmakingUser.mmr,
      joinedAt: matchmakingUser.joinedAt
    });
  }
}
