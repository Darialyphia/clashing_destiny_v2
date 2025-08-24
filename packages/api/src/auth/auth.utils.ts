import type { Id } from '../_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../_generated/server';
import { generateSecureRandomString } from '../utils/randomString';
import { DEFAULT_SESSION_TOTAL_DURATION_MS } from './auth.constants';

export const createSession = async (
  { db }: Pick<MutationCtx, 'db'>,
  userId: Id<'users'>
) => {
  return db.insert('authSessions', {
    userId,
    secretHash: await generateSecureRandomString(),
    expirationTime: Date.now() + DEFAULT_SESSION_TOTAL_DURATION_MS
  });
};
