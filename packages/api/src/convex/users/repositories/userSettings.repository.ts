import type { Doc } from '../../_generated/dataModel';
import type { DatabaseReader, DatabaseWriter } from '../../_generated/server';
import type { UserId } from '../entities/user.entity';

export type UserSettingsDoc = Doc<'userSettings'>;

export class UserSettingsReadRepository {
  static INJECTION_KEY = 'userSettingsReadRepo' as const;

  constructor(private ctx: { db: DatabaseReader }) {}

  async getByUserId(userId: UserId): Promise<UserSettingsDoc | null> {
    return this.ctx.db
      .query('userSettings')
      .withIndex('by_user_id', q => q.eq('userId', userId))
      .unique();
  }
}

export class UserSettingsRepository {
  static INJECTION_KEY = 'userSettingsRepo' as const;

  constructor(private ctx: { db: DatabaseWriter }) {}

  async getByUserId(userId: UserId): Promise<UserSettingsDoc | null> {
    return this.ctx.db
      .query('userSettings')
      .withIndex('by_user_id', q => q.eq('userId', userId))
      .unique();
  }

  async upsert(input: { userId: UserId; settings: unknown; version: number }) {
    const existing = await this.getByUserId(input.userId);

    if (existing) {
      await this.ctx.db.patch(existing._id, {
        settings: input.settings,
        version: input.version
      });
      return existing._id;
    }

    return this.ctx.db.insert('userSettings', input);
  }
}
