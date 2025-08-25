import { Id } from '../../_generated/dataModel';
import type { DatabaseReader, DatabaseWriter } from '../../_generated/server';
import { AppError } from '../../utils/error';
import { Matchmaking, MatchmakingUser } from '../entities/matchmaking.entity';

export class MatchmakingReadRepository {
  constructor(protected db: DatabaseReader) {}

  async getById(matchmakingId: Id<'matchmaking'>) {
    return this.db.get(matchmakingId);
  }

  async getByIdWithParticipants(
    matchmakingId: Id<'matchmaking'>
  ): Promise<Matchmaking | null> {
    const matchmakingData = await this.db.get(matchmakingId);
    if (!matchmakingData) return null;

    const participantRecords = await this.db
      .query('matchmakingUsers')
      .withIndex('by_matchmakingId', q => q.eq('matchmakingId', matchmakingId))
      .collect();

    const participants = participantRecords.map(
      record =>
        new MatchmakingUser({
          userId: record.userId,
          matchmakingId: record.matchmakingId,
          id: record._id
        })
    );

    return new Matchmaking({
      id: matchmakingData._id,
      name: matchmakingData.name,
      startedAt: matchmakingData.startedAt,
      participants,
      nextInvocationId: matchmakingData.nextInvocationId
    });
  }

  async getUserCurrentMatchmaking(userId: Id<'users'>): Promise<MatchmakingUser | null> {
    const record = await this.db
      .query('matchmakingUsers')
      .withIndex('by_userId', q => q.eq('userId', userId))
      .first();

    if (!record) return null;

    return new MatchmakingUser({
      userId: record.userId,
      matchmakingId: record.matchmakingId,
      id: record._id
    });
  }

  async getParticipantsInMatchmaking(
    matchmakingId: Id<'matchmaking'>
  ): Promise<MatchmakingUser[]> {
    const records = await this.db
      .query('matchmakingUsers')
      .withIndex('by_matchmakingId', q => q.eq('matchmakingId', matchmakingId))
      .collect();

    return records.map(
      record =>
        new MatchmakingUser({
          userId: record.userId,
          matchmakingId: record.matchmakingId,
          id: record._id
        })
    );
  }
}

export class MatchmakingRepository extends MatchmakingReadRepository {
  declare protected db: DatabaseWriter;

  constructor(db: DatabaseWriter) {
    super(db);
    this.db = db;
  }

  /**
   * Create a new matchmaking session
   */
  async createMatchmaking(config: { name: string }): Promise<Id<'matchmaking'>> {
    return this.db.insert('matchmaking', {
      name: config.name,
      startedAt: Date.now()
    });
  }

  /**
   * High-level business operation: User joins a matchmaking
   * Handles cross-matchmaking constraint: user can only be in one matchmaking at a time
   */
  async joinMatchmaking(
    userId: Id<'users'>,
    matchmakingId: Id<'matchmaking'>
  ): Promise<void> {
    // 1. Handle cross-matchmaking constraint (repository concern)
    const currentMatchmaking = await this.getUserCurrentMatchmaking(userId);
    if (currentMatchmaking) {
      await this.leaveCurrentMatchmaking(userId);
    }

    // 2. Load the target matchmaking aggregate
    const matchmaking = await this.getByIdWithParticipants(matchmakingId);
    if (!matchmaking) {
      throw new AppError('Matchmaking session not found');
    }

    // 3. Let the domain entity handle business rules
    const matchmakingUser = matchmaking.join(userId);

    // 4. Persist the changes
    await this.db.insert('matchmakingUsers', {
      userId: matchmakingUser.userId,
      matchmakingId: matchmakingUser.matchmakingId
    });
  }

  /**
   * High-level business operation: User leaves their current matchmaking
   */
  async leaveCurrentMatchmaking(userId: Id<'users'>): Promise<void> {
    const currentMatchmakingUser = await this.getUserCurrentMatchmaking(userId);
    if (!currentMatchmakingUser) {
      throw new AppError('User is not in any matchmaking');
    }

    // Load the matchmaking to let domain entity validate the leave operation
    const matchmaking = await this.getByIdWithParticipants(
      currentMatchmakingUser.matchmakingId
    );
    if (!matchmaking) {
      throw new AppError('Matchmaking session not found');
    }

    // Let domain entity handle the business logic
    matchmaking.leave(userId);

    // Persist the changes
    if (currentMatchmakingUser.id) {
      await this.db.delete(currentMatchmakingUser.id);
    }
  }

  /**
   * Delete a matchmaking session and all its participants
   */
  async deleteMatchmaking(matchmakingId: Id<'matchmaking'>): Promise<void> {
    // First remove all participants
    const participants = await this.getParticipantsInMatchmaking(matchmakingId);
    await Promise.all(participants.filter(p => p.id).map(p => this.db.delete(p.id!)));

    // Then delete the matchmaking itself
    await this.db.delete(matchmakingId);
  }

  /**
   * Update the next invocation ID for scheduled functions
   */
  async updateNextInvocation(
    matchmakingId: Id<'matchmaking'>,
    nextInvocationId: Id<'_scheduled_functions'>
  ): Promise<void> {
    await this.db.patch(matchmakingId, { nextInvocationId });
  }
}

/**
 * Factory functions to create repository instances
 */
export const createMatchmakingReadRepository = (db: DatabaseReader) =>
  new MatchmakingReadRepository(db);

export const createMatchmakingRepository = (db: DatabaseWriter) =>
  new MatchmakingRepository(db);
