import type { Id } from '../../_generated/dataModel';
import type { DatabaseReader, DatabaseWriter } from '../../_generated/server';
import {
  DEFAULT_SESSION_TOTAL_DURATION_MS,
  SESSION_VERIFICATION_INTERVAL_MS
} from '../auth.constants';

export class SessionReadRepository {
  static INJECTION_KEY = 'sessionReadRepo' as const;

  constructor(private ctx: { db: DatabaseReader }) {}

  async getById(sessionId: Id<'authSessions'>) {
    return this.ctx.db.get(sessionId);
  }

  async getByUserId(userId: Id<'users'>) {
    return this.ctx.db
      .query('authSessions')
      .withIndex('userId', q => q.eq('userId', userId))
      .collect();
  }

  async getValidSession(sessionId: Id<'authSessions'>) {
    const now = new Date();

    const session = await this.getById(sessionId);
    if (!session) return null;

    if (session.expirationTime < now.getTime()) {
      return null;
    }
    return session;
  }
}

export class SessionRepository {
  static INJECTION_KEY = 'sessionRepo' as const;

  constructor(private ctx: { db: DatabaseWriter }) {}

  async getById(sessionId: Id<'authSessions'>) {
    return this.ctx.db.get(sessionId);
  }

  async getByUserId(userId: Id<'users'>) {
    return this.ctx.db
      .query('authSessions')
      .withIndex('userId', q => q.eq('userId', userId))
      .collect();
  }

  async create(userId: Id<'users'>) {
    return this.ctx.db.insert('authSessions', {
      userId,
      expirationTime: Date.now() + DEFAULT_SESSION_TOTAL_DURATION_MS,
      lastVerifiedAt: Date.now()
    });
  }

  async delete(sessionId: Id<'authSessions'>) {
    await this.ctx.db.delete(sessionId);
  }

  async deleteAllForUser(userId: Id<'users'>) {
    const sessions = await this.getByUserId(userId);
    await Promise.all(sessions.map(session => this.ctx.db.delete(session._id)));
  }

  async updateLastVerified(sessionId: Id<'authSessions'>) {
    return this.ctx.db.patch(sessionId, {
      lastVerifiedAt: Date.now()
    });
  }

  async refresh(sessionId: Id<'authSessions'>) {
    return this.ctx.db.patch(sessionId, {
      expirationTime: Date.now() + DEFAULT_SESSION_TOTAL_DURATION_MS,
      lastVerifiedAt: Date.now()
    });
  }

  async getValidSession(sessionId: Id<'authSessions'>) {
    const session = await this.getById(sessionId);
    if (!session) return null;
    const now = Date.now();

    const timeSinceLastVerification = now - session.lastVerifiedAt;
    if (timeSinceLastVerification > SESSION_VERIFICATION_INTERVAL_MS) {
      await this.refresh(session._id);
    }

    return session;
  }
}
