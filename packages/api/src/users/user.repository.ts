import type { QueryCtx } from '../_generated/server';
import { Email } from '../utils/email';

export const getUserByEmail = (ctx: Pick<QueryCtx, 'db'>, email: Email) => {
  return ctx.db
    .query('users')
    .withIndex('by_email', q => q.eq('email', email.value))
    .unique();
};
