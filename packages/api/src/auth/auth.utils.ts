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
import { Id } from '../_generated/dataModel';

import { Nullable } from '@game/shared';
import { AuthSession } from './entities/session.entity';
import { AppError } from '../utils/error';
import {
  createSessionReadRepository,
  createSessionRepository
} from './repositories/session.repository';

export const queryWithSession = customQuery(query, {
  args: {
    sessionId: v.union(v.null(), v.string())
  },
  input: async (ctx, args: any) => {
    const sessionRepo = createSessionReadRepository(ctx.db);
    const session = await sessionRepo.getValidSession(
      args.sessionId as Id<'authSessions'>
    );
    return { ctx: { ...ctx, session }, args: {} };
  }
});

export const internalQueryWithSession = customQuery(internalQuery, {
  args: {
    sessionId: v.union(v.null(), v.string())
  },
  input: async (ctx, args: any) => {
    const sessionRepo = createSessionReadRepository(ctx.db);
    const session = await sessionRepo.getValidSession(
      args.sessionId as Id<'authSessions'>
    );
    return { ctx: { ...ctx, session }, args: {} };
  }
});

export const mutationWithSession = customMutation(mutation, {
  args: {
    sessionId: v.union(v.null(), v.string())
  },
  input: async (ctx, args: any) => {
    const sessionRepo = createSessionRepository(ctx.db);
    const session = await sessionRepo.getValidSession(
      args.sessionId as Id<'authSessions'>
    );
    return { ctx: { ...ctx, session }, args: {} };
  }
});

export const internalMutationWithSession = customMutation(internalMutation, {
  args: {
    sessionId: v.union(v.null(), v.string())
  },
  input: async (ctx, args: any) => {
    const sessionRepo = createSessionRepository(ctx.db);
    const session = await sessionRepo.getValidSession(
      args.sessionId as Id<'authSessions'>
    );
    return { ctx: { ...ctx, session }, args: {} };
  }
});

export const ensureAuthenticated = (session: Nullable<AuthSession>) => {
  if (!session) throw new AppError(`Unauthorized`);

  return session;
};

export type QueryCtxWithSession = QueryCtx & { session: AuthSession | null };
export type MutationCtxWithSession = MutationCtx & { session: AuthSession | null };
