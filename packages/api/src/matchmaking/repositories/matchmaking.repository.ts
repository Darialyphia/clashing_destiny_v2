import type { Doc, Id } from '../../_generated/dataModel';
import type { DatabaseReader, DatabaseWriter } from '../../_generated/server';
import { AppError } from '../../utils/error';
import { Matchmaking } from '../entities/matchmaking.entity';
import { User } from '../../users/entities/user.entity';
import { MatchmakingUser } from '../entities/matchmakingUser.entity';

export class MatchmakingReadRepository {
  constructor(protected db: DatabaseReader) {}

  async getById(matchmakingId: Id<'matchmaking'>): Promise<Matchmaking | null> {
    const matchmakingData = await this.db.get(matchmakingId);
    if (!matchmakingData) return null;

    return this.buildMatchmakingEntity(matchmakingData);
  }

  async getByName(name: string): Promise<Matchmaking | null> {
    const matchmakingData = await this.db
      .query('matchmaking')
      .filter(q => q.eq(q.field('name'), name))
      .first();

    if (!matchmakingData) return null;

    return this.buildMatchmakingEntity(matchmakingData);
  }

  protected async buildMatchmakingEntity(
    matchmakingData: Doc<'matchmaking'>
  ): Promise<Matchmaking> {
    const participants = await this.loadParticipants(matchmakingData._id);

    return new Matchmaking({
      data: {
        id: matchmakingData._id,
        name: matchmakingData.name,
        startedAt: matchmakingData.startedAt,
        nextInvocationId: matchmakingData.nextInvocationId
      },
      participants
    });
  }

  protected async buildMatchmakingUserEntity(
    record: Doc<'matchmakingUsers'>
  ): Promise<MatchmakingUser> {
    const user = await this.db.get(record.userId);
    if (!user) {
      throw new AppError('Inconsistent data: user not found for matchmaking participant');
    }

    return new MatchmakingUser({
      userId: record.userId,
      matchmakingId: record.matchmakingId,
      id: record._id,
      mmr: user.mmr
    });
  }

  private async loadParticipants(
    matchmakingId: Id<'matchmaking'>
  ): Promise<MatchmakingUser[]> {
    const participantRecords = await this.db
      .query('matchmakingUsers')
      .withIndex('by_matchmakingId', q => q.eq('matchmakingId', matchmakingId))
      .collect();

    return Promise.all(participantRecords.map(r => this.buildMatchmakingUserEntity(r)));
  }
}

export class MatchmakingRepository extends MatchmakingReadRepository {
  declare protected db: DatabaseWriter;

  constructor(db: DatabaseWriter) {
    super(db);
    this.db = db;
  }

  async create(config: { name: string }): Promise<Id<'matchmaking'>> {
    return this.db.insert('matchmaking', {
      name: config.name
    });
  }

  async joinMatchmaking(user: User, matchmakingId: Id<'matchmaking'>): Promise<void> {
    const matchmaking = await this.getById(matchmakingId);
    if (!matchmaking) {
      throw new AppError('Matchmaking session not found');
    }

    if (!user.canJoinMatchmaking(matchmaking)) {
      throw new AppError('User cannot join this matchmaking');
    }

    const currentMatchmaking = user.getCurrentMatchmaking();
    if (currentMatchmaking?.id) {
      await this.db.delete(currentMatchmaking.id);
    }

    const matchmakingUserRecord = await this.db
      .query('matchmakingUsers')
      .filter(q => q.eq(q.field('userId'), user.id))
      .filter(q => q.eq(q.field('matchmakingId'), matchmakingId))
      .first();

    if (!matchmakingUserRecord) {
      throw new AppError('User is not part of this matchmaking');
    }

    const matchmakingUser = await this.buildMatchmakingUserEntity(matchmakingUserRecord);
    matchmaking.join(matchmakingUser);

    await this.db.insert('matchmakingUsers', {
      userId: matchmakingUser.userId,
      matchmakingId: matchmakingUser.matchmakingId
    });
  }

  async delete(matchmaking: Matchmaking) {
    await Promise.all(matchmaking.participants.map(p => this.db.delete(p.id)));
    await this.db.delete(matchmaking.id);
  }

  async leaveCurrentMatchmaking(user: User): Promise<void> {
    if (!user.canLeaveMatchmaking()) {
      throw new AppError('User is not in any matchmaking');
    }

    const currentMatchmakingUser = user.getCurrentMatchmaking()!;

    const matchmaking = await this.getById(currentMatchmakingUser.matchmakingId, {
      include: { participants: true }
    });
    if (!matchmaking) {
      throw new AppError('Matchmaking session not found');
    }

    // Let domain entity handle the business logic
    matchmaking.leave(user.id);

    // Persist the changes
    if (currentMatchmakingUser.id) {
      await this.db.delete(currentMatchmakingUser.id);
    }
  }

  async deleteMatchmaking(matchmakingId: Id<'matchmaking'>): Promise<void> {
    const participants = await this.getParticipantsInMatchmaking(matchmakingId);
    await Promise.all(participants.filter(p => p.id).map(p => this.db.delete(p.id!)));

    await this.db.delete(matchmakingId);
  }

  async updateNextInvocation(
    matchmakingId: Id<'matchmaking'>,
    nextInvocationId: Id<'_scheduled_functions'>
  ): Promise<void> {
    await this.db.patch(matchmakingId, { nextInvocationId });
  }
}

export const createMatchmakingReadRepository = (db: DatabaseReader) =>
  new MatchmakingReadRepository(db);

export const createMatchmakingRepository = (db: DatabaseWriter) =>
  new MatchmakingRepository(db);
