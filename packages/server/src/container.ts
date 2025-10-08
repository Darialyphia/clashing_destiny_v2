import {
  asClass,
  asFunction,
  asValue,
  createContainer,
  InjectionMode,
  Lifetime,
  type Resolver
} from 'awilix';
import { redis } from './redis';
import { convexClient, convexHttpClient } from './convex';
import { GamesManager } from './games-manager';
import { io } from './io';
import { RoomManager } from './room-manager';
import { http } from './http';

type Dependency<T> = { resolver: Resolver<T>; eager?: boolean };
type DependenciesMap = Record<string, Dependency<any>>;

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
      // Resolve eager dependencies immediately
      container.resolve(key);
    });

  return container;
};

const deps = {
  http: { resolver: asFunction(http, { lifetime: Lifetime.SINGLETON }) },
  io: { resolver: asFunction(io, { lifetime: Lifetime.SINGLETON }) },
  redis: { resolver: asFunction(redis, { lifetime: Lifetime.SINGLETON }) },
  convexClient: { resolver: asFunction(convexClient) },
  convexHttpClient: { resolver: asFunction(convexHttpClient) },
  [GamesManager.INJECTION_KEY]: {
    resolver: asClass(GamesManager, { lifetime: Lifetime.SINGLETON })
  },
  [RoomManager.INJECTION_KEY]: {
    resolver: asClass(RoomManager, { lifetime: Lifetime.SINGLETON })
  }
} as const satisfies DependenciesMap;

export const container = makecontainer(deps);
