import type { Id } from '../../_generated/dataModel';
import type { DatabaseReader, DatabaseWriter } from '../../_generated/server';
import { DomainError } from '../../utils/error';
import { Matchmaking, MatchmakingDoc } from '../entities/matchmaking.entity';
import { MatchmakingUserDoc } from '../entities/matchmakingUser.entity';
import { MatchmakingUserRepository } from './matchmakingUser.repository';

export class MatchmakingReadRepository {
  constructor(protected db: DatabaseReader) {}

  async getById(matchmakingId: Id<'matchmaking'>) {
    return this.db.get(matchmakingId);
  }

  async getByName(name: string) {
    return this.db
      .query('matchmaking')
      .filter(q => q.eq(q.field('name'), name))
      .first();
  }
}

export class MatchmakingRepository {
  declare protected db: DatabaseWriter;
  declare protected matchmakingUserRepo: MatchmakingUserRepository;

  constructor(config: {
    db: DatabaseWriter;
    matchmakingUserRepo: MatchmakingUserRepository;
  }) {
    this.db = config.db;
    this.matchmakingUserRepo = config.matchmakingUserRepo;
  }

  private async buildEntity(doc: MatchmakingDoc) {
    const matchmakingUsers = await this.matchmakingUserRepo.getByMatchmakingId(doc._id);

    return new Matchmaking(doc._id, {
      matchmaking: doc,
      matchmakingUsers
    });
  }

  async getById(matchmakingId: Id<'matchmaking'>) {
    const matchmakingDoc = await this.db.get(matchmakingId);

    if (!matchmakingDoc) return null;

    return this.buildEntity(matchmakingDoc);
  }

  async getByName(name: string) {
    const matchmakingDoc = await this.db
      .query('matchmaking')
      .filter(q => q.eq(q.field('name'), name))
      .first();

    if (!matchmakingDoc) return null;

    return this.buildEntity(matchmakingDoc);
  }

  async getByUserId(userId: Id<'users'>) {
    const matchmakingUserDoc = await this.db
      .query('matchmakingUsers')
      .withIndex('by_userId', q => q.eq('userId', userId))
      .first();

    if (!matchmakingUserDoc) return null;

    return this.getById(matchmakingUserDoc.matchmakingId);
  }

  async save(matchmaking: Matchmaking) {
    await this.db.insert('matchmaking', {
      name: matchmaking.name,
      startedAt: matchmaking.startedAt,
      nextInvocationId: matchmaking.nextInvocationId
    });

    await Promise.all(
      matchmaking.participants.map(async user => this.matchmakingUserRepo.save(user))
    );
  }
}
