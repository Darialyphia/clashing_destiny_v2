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
import {
  getValidSession,
  getValidSessionAndRenew
} from './repositories/session.repository';
import { Nullable } from '@game/shared';
import { AuthSession } from './entities/session.entity';
import { AppError } from '../utils/error';

export const queryWithSession = customQuery(query, {
  args: {
    sessionId: v.union(v.null(), v.string())
  },
  input: async (ctx, args: any) => {
    const session = await getValidSession(ctx, args.sessionId as Id<'authSessions'>);
    return { ctx: { ...ctx, session }, args: {} };
  }
});

export const internalQueryWithSession = customQuery(internalQuery, {
  args: {
    sessionId: v.union(v.null(), v.string())
  },
  input: async (ctx, args: any) => {
    const session = await getValidSession(ctx, args.sessionId as Id<'authSessions'>);
    return { ctx: { ...ctx, session }, args: {} };
  }
});

export const mutationWithSession = customMutation(mutation, {
  args: {
    sessionId: v.union(v.null(), v.string())
  },
  input: async (ctx, args: any) => {
    const session = await getValidSessionAndRenew(
      ctx,
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
    const session = await getValidSessionAndRenew(
      ctx,
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
