import { Id } from '../../_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../../_generated/server';
import {
  DEFAULT_SESSION_TOTAL_DURATION_MS,
  SESSION_VERIFICATION_INTERVAL_MS
} from '../auth.constants';

export const createSession = async (
  { db }: Pick<MutationCtx, 'db'>,
  userId: Id<'users'>
) => {
  return db.insert('authSessions', {
    userId,
    expirationTime: Date.now() + DEFAULT_SESSION_TOTAL_DURATION_MS,
    lastVerifiedAt: Date.now()
  });
};

export const getSession = async (
  { db }: Pick<QueryCtx, 'db'>,
  sessionId: Id<'authSessions'>
) => {
  return db.get(sessionId);
};

export const deleteSession = async (
  { db }: Pick<MutationCtx, 'db'>,
  sessionId: Id<'authSessions'>
) => {
  await db.delete(sessionId);
};

export const getValidSession = async (
  { db }: Pick<QueryCtx, 'db'>,
  sessionId: Id<'authSessions'>
) => {
  const now = new Date();

  const session = await getSession({ db }, sessionId);
  if (!session) {
    return null;
  }

  if (session.expirationTime < now.getTime()) {
    return null;
  }
  return session;
};

export const getValidSessionAndRenew = async (
  { db }: Pick<MutationCtx, 'db'>,
  sessionId: Id<'authSessions'>
) => {
  const now = new Date();

  const session = await getSession({ db }, sessionId);
  if (!session) {
    return null;
  }

  if (session.expirationTime < now.getTime()) {
    return null;
  }

  const timeSinceLastVerification = now.getTime() - session.lastVerifiedAt;
  if (timeSinceLastVerification > SESSION_VERIFICATION_INTERVAL_MS) {
    await db.patch(sessionId, {
      lastVerifiedAt: now.getTime(),
      expirationTime: now.getTime() + SESSION_VERIFICATION_INTERVAL_MS
    });
  }

  return session;
};
