import { asValue, createContainer, InjectionMode, type Resolver } from 'awilix';
import { customMutation, customQuery } from 'convex-helpers/server/customFunctions';
import {
  internalMutationWithSession,
  internalQueryWithSession,
  mutationWithSession,
  queryWithSession,
  type MutationCtxWithSession,
  type QueryCtxWithSession
} from '../auth/auth.utils';
import type { AuthSession } from '../auth/entities/session.entity';
import { eventEmitter } from './eventEmitter';
import * as authProviders from '../auth/auth.providers';
import * as userProviders from '../users/users.providers';
import * as gameProviders from '../game/game.providers';
import * as matchmakingProviders from '../matchmaking/matchmaking.providers';
import * as deckProviders from '../deck/deck.providers';
import * as cardProviders from '../card/card.providers';
import * as friendProviders from '../friend/friend.providers';
import * as lobbyProviders from '../lobby/lobby.providers';
import * as giftProviders from '../gift/gift.providers';

export type Dependency<T> = { resolver: Resolver<T>; eager?: boolean };
export type DependenciesMap = Record<string, Dependency<any>>;

const makecontainer = (deps: DependenciesMap) => {
  const container = createContainer({
    injectionMode: InjectionMode.PROXY
  });

  Object.entries(deps).forEach(([key, { resolver }]) => {
    container.register(key, resolver);
  });

  Object.entries(deps)
    .filter(([, { eager }]) => eager)
    .forEach(([key]) => {
      // Resolve eager dependencies immediately, to start domain event subscribers etc
      container.resolve(key);
    });

  return container;
};

const makeQueryDependencies = (ctx: QueryCtxWithSession) => {
  const deps = {
    db: { resolver: asValue(ctx.db) },
    session: { resolver: asValue(ctx.session as AuthSession | null) },
    ...authProviders.queryDependencies,
    ...userProviders.queryDependencies,
    ...gameProviders.queryDependencies,
    ...matchmakingProviders.queryDependencies,
    ...deckProviders.queryDependencies,
    ...cardProviders.queryDependencies,
    ...friendProviders.queryDependencies,
    ...lobbyProviders.queryDependencies,
    ...giftProviders.queryDependencies
  } as const satisfies DependenciesMap;

  return deps;
};

export const createQueryContainer = (ctx: QueryCtxWithSession) => {
  return makecontainer(makeQueryDependencies(ctx));
};

const makeMutationDependencies = (ctx: MutationCtxWithSession) => {
  const deps = {
    nodeName: { resolver: asValue(null) }, // there is a very weird bug in awilix when used in convex environment where it tries to resolve the "nodeName" dependency, this is a workaround
    db: { resolver: asValue(ctx.db) },
    session: { resolver: asValue(ctx.session) },
    scheduler: { resolver: asValue(ctx.scheduler) },
    eventEmitter: { resolver: asValue(eventEmitter) },
    ...authProviders.mutationDependencies,
    ...userProviders.mutationDependencies,
    ...gameProviders.mutationDependencies,
    ...matchmakingProviders.mutationDependencies,
    ...deckProviders.mutationDependencies,
    ...cardProviders.mutationDependencies,
    ...friendProviders.mutationDependencies,
    ...lobbyProviders.mutationDependencies,
    ...giftProviders.mutationDependencies
  } as const satisfies DependenciesMap;

  return deps;
};

export const createMutationContainer = (ctx: MutationCtxWithSession) => {
  return makecontainer(makeMutationDependencies(ctx));
};

export const queryWithContainer = customQuery(queryWithSession, {
  args: {},
  input: async ctx => {
    const container = createQueryContainer(ctx as QueryCtxWithSession);
    return { ctx: container, args: {} };
  }
});

export const internalQueryWithContainer = customQuery(internalQueryWithSession, {
  args: {},
  input: async ctx => {
    const container = createQueryContainer(ctx as QueryCtxWithSession);
    return { ctx: container, args: {} };
  }
});

export const mutationWithContainer = customMutation(mutationWithSession, {
  args: {},
  input(ctx) {
    const container = createMutationContainer(ctx as MutationCtxWithSession);
    return { ctx: container, args: {} };
  }
});

export const internalMutationWithContainer = customMutation(internalMutationWithSession, {
  args: {},
  input(ctx) {
    const container = createMutationContainer(ctx as MutationCtxWithSession);
    return { ctx: container, args: {} };
  }
});
