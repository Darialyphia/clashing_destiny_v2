import { asClass, asValue, createContainer, InjectionMode, type Resolver } from 'awilix';
import { redis } from './redis';
import { convexClient, convexHttpClient } from './convex';
import { GamesManager } from './games-manager';
import { io } from './io';
import { RoomManager } from './room-manager';

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
  io: { resolver: asValue(io) },
  redis: { resolver: asValue(redis) },
  convexClient: { resolver: asValue(convexClient) },
  convexHttpClient: { resolver: asValue(convexHttpClient) },
  [GamesManager.INJECTION_KEY]: { resolver: asClass(GamesManager) },
  [RoomManager.INJECTION_KEY]: { resolver: asClass(RoomManager) }
} as const satisfies DependenciesMap;

export const container = makecontainer(deps);
