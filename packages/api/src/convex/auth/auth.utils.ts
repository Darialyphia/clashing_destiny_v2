import { customMutation, customQuery } from 'convex-helpers/server/customFunctions';
import {
  internalMutation,
  internalQuery,
  mutation,
  type MutationCtx,
  query,
  type QueryCtx
} from '../_generated/server';
import { v } from 'convex/values';
import type { Id } from '../_generated/dataModel';
import type { Nullable } from '@game/shared';
import { type AuthSession } from './entities/session.entity';
import { AppError } from '../utils/error';
import {
  SessionReadRepository,
  SessionRepository
} from './repositories/session.repository';

export const queryWithSession = customQuery(query, {
  args: {
    sessionId: v.optional(v.union(v.null(), v.string()))
  },
  input: async (ctx, args: any) => {
    const sessionRepo = new SessionReadRepository({ db: ctx.db });
    const session = args.sessionId
      ? await sessionRepo.getValidSession(args.sessionId as Id<'authSessions'>)
      : null;
    return { ctx: { ...ctx, session }, args: {} };
  }
});
export type QueryWithSessionCtx = QueryCtx & { session: AuthSession };

export const internalQueryWithSession = customQuery(internalQuery, {
  args: {
    sessionId: v.optional(v.union(v.null(), v.string()))
  },
  input: async (ctx, args: any) => {
    const sessionRepo = new SessionReadRepository({ db: ctx.db });
    const session = args.sessionId
      ? await sessionRepo.getValidSession(args.sessionId as Id<'authSessions'>)
      : null;
    return { ctx: { ...ctx, session }, args: {} };
  }
});

export const mutationWithSession = customMutation(mutation, {
  args: {
    sessionId: v.optional(v.union(v.null(), v.string()))
  },
  input: async (ctx, args: any) => {
    const sessionRepo = new SessionRepository({ db: ctx.db });
    const session = args.sessionId
      ? await sessionRepo.getValidSession(args.sessionId as Id<'authSessions'>)
      : null;
    return { ctx: { ...ctx, session }, args: {} };
  }
});
export type MutationWithSessionCtx = MutationCtx & { session: AuthSession };

export const internalMutationWithSession = customMutation(internalMutation, {
  args: {
    sessionId: v.optional(v.union(v.null(), v.string()))
  },
  input: async (ctx, args: any) => {
    const sessionRepo = new SessionRepository({ db: ctx.db });
    const session = args.sessionId
      ? await sessionRepo.getValidSession(args.sessionId as Id<'authSessions'>)
      : null;
    return { ctx: { ...ctx, session }, args: {} };
  }
});

export const ensureAuthenticated = (session: Nullable<AuthSession>) => {
  if (!session) throw new AppError(`Unauthorized`);

  return session;
};

export const ensureValidApiKey = (providedKey: string) => {
  if (providedKey !== process.env.GAME_SERVER_API_KEY) throw new AppError(`Unauthorized`);
};

export type QueryCtxWithSession = QueryCtx & { session: AuthSession | null };
export type MutationCtxWithSession = MutationCtx & { session: AuthSession | null };
