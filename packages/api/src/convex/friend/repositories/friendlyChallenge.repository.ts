import type { Id } from '../../_generated/dataModel';
import type { DatabaseReader, DatabaseWriter } from '../../_generated/server';
import { FriendlyChallenge } from '../entities/friendlyChallenge.entity';
import type { FriendlyChallengeMapper } from '../mappers/friendlyChallenge.mapper';

export class FriendlyChallengeReadRepository {
  static INJECTION_KEY = 'friendlyChallengeReadRepo' as const;

  constructor(private ctx: { db: DatabaseReader }) {}

  async getById(friendlyChallengeId: Id<'friendlyChallenges'>) {
    return this.ctx.db.get(friendlyChallengeId);
  }

  async getByChallengerAndChallenged(
    challengerId: Id<'users'>,
    challengedId: Id<'users'>
  ) {
    return this.ctx.db
      .query('friendlyChallenges')
      .withIndex('by_user_id', q =>
        q.eq('challengerId', challengerId).eq('challengedId', challengedId)
      )
      .unique();
  }

  async getByChallengerId(challengerId: Id<'users'>) {
    return this.ctx.db
      .query('friendlyChallenges')
      .withIndex('by_challenger_id', q => q.eq('challengerId', challengerId))
      .collect();
  }

  async getByChallengedId(challengedId: Id<'users'>) {
    return this.ctx.db
      .query('friendlyChallenges')
      .withIndex('by_challenged_id', q => q.eq('challengedId', challengedId))
      .collect();
  }

  async getPendingByChallengedId(challengedId: Id<'users'>) {
    return this.ctx.db
      .query('friendlyChallenges')
      .withIndex('by_challenged_id', q => q.eq('challengedId', challengedId))
      .filter(q => q.eq(q.field('status'), 'pending'))
      .collect();
  }

  async getAcceptedByUserId(userId: Id<'users'>) {
    const asChallenger = await this.ctx.db
      .query('friendlyChallenges')
      .withIndex('by_challenger_id', q => q.eq('challengerId', userId))
      .filter(q => q.eq(q.field('status'), 'accepted'))
      .collect();

    const asChallenged = await this.ctx.db
      .query('friendlyChallenges')
      .withIndex('by_challenged_id', q => q.eq('challengedId', userId))
      .filter(q => q.eq(q.field('status'), 'accepted'))
      .collect();

    return [...asChallenger, ...asChallenged];
  }
}

export class FriendlyChallengeRepository {
  static INJECTION_KEY = 'friendlyChallengeRepo' as const;

  constructor(
    private ctx: { db: DatabaseWriter; friendlyChallengeMapper: FriendlyChallengeMapper }
  ) {}

  async getById(friendlyChallengeId: Id<'friendlyChallenges'>) {
    const doc = await this.ctx.db.get(friendlyChallengeId);
    if (!doc) return null;

    return FriendlyChallenge.from(doc);
  }

  async getByChallengerAndChallenged(
    challengerId: Id<'users'>,
    challengedId: Id<'users'>
  ) {
    const doc = await this.ctx.db
      .query('friendlyChallenges')
      .withIndex('by_user_id', q =>
        q.eq('challengerId', challengerId).eq('challengedId', challengedId)
      )
      .unique();

    if (!doc) return null;

    return FriendlyChallenge.from(doc);
  }

  async getByChallengerId(challengerId: Id<'users'>) {
    const docs = await this.ctx.db
      .query('friendlyChallenges')
      .withIndex('by_challenger_id', q => q.eq('challengerId', challengerId))
      .collect();

    return docs.map(doc => FriendlyChallenge.from(doc));
  }

  async getByChallengedId(challengedId: Id<'users'>) {
    const docs = await this.ctx.db
      .query('friendlyChallenges')
      .withIndex('by_challenged_id', q => q.eq('challengedId', challengedId))
      .collect();

    return docs.map(doc => FriendlyChallenge.from(doc));
  }

  async getPendingByChallengedId(challengedId: Id<'users'>) {
    const docs = await this.ctx.db
      .query('friendlyChallenges')
      .withIndex('by_challenged_id', q => q.eq('challengedId', challengedId))
      .filter(q => q.eq(q.field('status'), 'pending'))
      .collect();

    return docs.map(doc => FriendlyChallenge.from(doc));
  }

  async getPendingByChallengerId(challengerId: Id<'users'>) {
    const docs = await this.ctx.db
      .query('friendlyChallenges')
      .withIndex('by_challenger_id', q => q.eq('challengerId', challengerId))
      .filter(q => q.eq(q.field('status'), 'pending'))
      .collect();

    return docs.map(doc => FriendlyChallenge.from(doc));
  }

  async getPendingChallengeBetweenUsers(
    challengerId: Id<'users'>,
    challengedId: Id<'users'>
  ) {
    const doc = await this.ctx.db
      .query('friendlyChallenges')
      .withIndex('by_user_id', q =>
        q.eq('challengerId', challengerId).eq('challengedId', challengedId)
      )
      .filter(q => q.eq(q.field('status'), 'pending'))
      .unique();

    if (!doc) return null;

    return FriendlyChallenge.from(doc);
  }

  async create(input: {
    challengerId: Id<'users'>;
    challengedId: Id<'users'>;
    status: 'pending' | 'accepted' | 'declined';
    challengerDeckId?: Id<'decks'>;
    challengedDeckId?: Id<'decks'>;
    gameId?: Id<'games'>;
  }) {
    return this.ctx.db.insert('friendlyChallenges', {
      challengerId: input.challengerId,
      challengedId: input.challengedId,
      status: input.status,
      challengerDeckId: input.challengerDeckId,
      challengedDeckId: input.challengedDeckId,
      gameId: input.gameId
    });
  }

  save(friendlyChallenge: FriendlyChallenge) {
    return this.ctx.db.replace(
      friendlyChallenge.id,
      this.ctx.friendlyChallengeMapper.toPersistence(friendlyChallenge)
    );
  }

  async delete(friendlyChallengeId: Id<'friendlyChallenges'>) {
    return this.ctx.db.delete(friendlyChallengeId);
  }
}
