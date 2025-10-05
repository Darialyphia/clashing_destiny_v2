import { internal } from '../../_generated/api';
import type { Id } from '../../_generated/dataModel';
import type { Scheduler } from 'convex/server';
import type { DatabaseReader, DatabaseWriter } from '../../_generated/server';
import { Matchmaking, type MatchmakingDoc } from '../entities/matchmaking.entity';
import type { MatchmakingMapper } from '../mappers/matchmaking.mapper';
import { MATCHMAKING_SCHEDULER_INTERVAL_MS } from '../matchmaking.constants';
import type { MatchmakingUserRepository } from './matchmakingUser.repository';

export class MatchmakingReadRepository {
  static INJECTION_KEY = 'matchmakingReadRepo' as const;

  constructor(protected ctx: { db: DatabaseReader }) {}

  async getById(matchmakingId: Id<'matchmaking'>) {
    return this.ctx.db.get(matchmakingId);
  }

  async getByName(name: string) {
    return this.ctx.db
      .query('matchmaking')
      .filter(q => q.eq(q.field('name'), name))
      .first();
  }

  async getByUserId(userId: Id<'users'>) {
    const matchmakingUserDoc = await this.ctx.db
      .query('matchmakingUsers')
      .withIndex('by_userId', q => q.eq('userId', userId))
      .first();

    if (!matchmakingUserDoc) return null;

    return this.getById(matchmakingUserDoc.matchmakingId);
  }

  getAll() {
    return this.ctx.db.query('matchmaking').collect();
  }
}

export class MatchmakingRepository {
  static INJECTION_KEY = 'matchmakingRepo' as const;

  constructor(
    private ctx: {
      db: DatabaseWriter;
      matchmakingUserRepo: MatchmakingUserRepository;
      scheduler: Scheduler;
      matchmakingMapper: MatchmakingMapper;
    }
  ) {}

  private async buildEntity(doc: MatchmakingDoc) {
    const matchmakingUsers = await this.ctx.matchmakingUserRepo.getByMatchmakingId(
      doc._id
    );

    return new Matchmaking(doc._id, {
      matchmaking: doc,
      matchmakingUsers
    });
  }

  async getById(matchmakingId: Id<'matchmaking'>) {
    const matchmakingDoc = await this.ctx.db.get(matchmakingId);

    if (!matchmakingDoc) return null;

    return this.buildEntity(matchmakingDoc);
  }

  async getByName(name: string) {
    const matchmakingDoc = await this.ctx.db
      .query('matchmaking')
      .filter(q => q.eq(q.field('name'), name))
      .first();

    if (!matchmakingDoc) return null;

    return this.buildEntity(matchmakingDoc);
  }

  async getByUserId(userId: Id<'users'>) {
    const matchmakingUserDoc = await this.ctx.db
      .query('matchmakingUsers')
      .withIndex('by_userId', q => q.eq('userId', userId))
      .first();

    if (!matchmakingUserDoc) return null;

    return this.getById(matchmakingUserDoc.matchmakingId);
  }

  async save(matchmaking: Matchmaking) {
    await this.ctx.db.replace(
      matchmaking.id,
      this.ctx.matchmakingMapper.toPersistence(matchmaking)
    );

    const matchmakingUsers = await this.ctx.matchmakingUserRepo.getByMatchmakingId(
      matchmaking.id
    );
    const toDelete = matchmakingUsers.filter(mu => !matchmaking.isInMatchmaking(mu));
    await Promise.all(toDelete.map(mu => this.ctx.matchmakingUserRepo.delete(mu.id)));

    await Promise.all(
      matchmaking.participants.map(async user => this.ctx.matchmakingUserRepo.save(user))
    );
  }

  async scheduleRun(matchmaking: Matchmaking) {
    const nextInvocationId = await this.ctx.scheduler.runAfter(
      MATCHMAKING_SCHEDULER_INTERVAL_MS,
      internal.matchmaking.run,
      { name: matchmaking.name }
    );
    matchmaking.scheduleRun(nextInvocationId);
  }
}
