import type { Id } from '../../_generated/dataModel';
import type { DatabaseReader, DatabaseWriter } from '../../_generated/server';
import { UserRepository } from '../../users/repositories/user.repository';
import { DomainError } from '../../utils/error';
import { MatchmakingUser, MatchmakingUserDoc } from '../entities/matchmakingUser.entity';

export class MatchmakingUserReadRepository {
  constructor(protected db: DatabaseReader) {}

  async getById(matchmakingId: Id<'matchmakingUsers'>) {
    return this.db.get(matchmakingId);
  }

  async getByMatchmakingId(matchmakingId: Id<'matchmaking'>) {
    return this.db
      .query('matchmakingUsers')
      .withIndex('by_matchmakingId', q => q.eq('matchmakingId', matchmakingId))
      .collect();
  }

  async byUserId(userId: Id<'users'>) {
    return this.db
      .query('matchmakingUsers')
      .withIndex('by_userId', q => q.eq('userId', userId))
      .unique();
  }
}

export class MatchmakingUserRepository {
  declare protected db: DatabaseWriter;
  declare protected userRepo: UserRepository;

  constructor(db: DatabaseWriter, userRepo: UserRepository) {
    this.db = db;
    this.userRepo = userRepo;
  }

  private async buildEntity(doc: MatchmakingUserDoc) {
    const userDoc = await this.userRepo.getById(doc.userId);

    if (!userDoc) throw new DomainError('User not found');

    return new MatchmakingUser(doc._id, { ...doc, mmr: userDoc.mmr });
  }

  async getById(matchmakingId: Id<'matchmakingUsers'>) {
    const doc = await this.db.get(matchmakingId);

    if (!doc) return null;

    return this.buildEntity(doc);
  }

  async getByMatchmakingId(matchmakingId: Id<'matchmaking'>) {
    const docs = await this.db
      .query('matchmakingUsers')
      .withIndex('by_matchmakingId', q => q.eq('matchmakingId', matchmakingId))
      .collect();

    return Promise.all(docs.map(doc => this.buildEntity(doc)));
  }

  async byUserId(userId: Id<'users'>) {
    const doc = await this.db
      .query('matchmakingUsers')
      .withIndex('by_userId', q => q.eq('userId', userId))
      .unique();

    if (!doc) throw null;

    return this.buildEntity(doc);
  }

  async create({
    matchmakingId,
    userId
  }: {
    matchmakingId: Id<'matchmaking'>;
    userId: Id<'users'>;
  }) {
    return this.db.insert('matchmakingUsers', {
      matchmakingId,
      userId
    });
  }

  async save(matchmakingUser: MatchmakingUser) {
    await this.db.replace(matchmakingUser.id, {
      matchmakingId: matchmakingUser.matchmakingId,
      userId: matchmakingUser.userId
    });
  }
}
