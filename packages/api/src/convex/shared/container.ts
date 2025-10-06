import { asClass, asValue, createContainer, InjectionMode, type Resolver } from 'awilix';
import {
  SessionReadRepository,
  SessionRepository
} from '../auth/repositories/session.repository';
import { LoginUseCase } from '../auth/usecases/login.usecase';
import { LogoutUseCase } from '../auth/usecases/logout.usecase';
import { RegisterUseCase } from '../auth/usecases/register.usecase';
import { customMutation, customQuery } from 'convex-helpers/server/customFunctions';
import {
  internalMutationWithSession,
  internalQueryWithSession,
  mutationWithSession,
  queryWithSession,
  type MutationCtxWithSession,
  type QueryCtxWithSession
} from '../auth/auth.utils';
import { GameReadRepository, GameRepository } from '../game/repositories/game.repository';
import {
  GamePlayerReadRepository,
  GamePlayerRepository
} from '../game/repositories/gamePlayer.repository';
import {
  MatchmakingReadRepository,
  MatchmakingRepository
} from '../matchmaking/repositories/matchmaking.repository';
import {
  MatchmakingUserReadRepository,
  MatchmakingUserRepository
} from '../matchmaking/repositories/matchmakingUser.repository';
import {
  UserReadRepository,
  UserRepository
} from '../users/repositories/user.repository';
import { JoinMatchmakingUseCase } from '../matchmaking/usecases/joinMatchmaking.usecase';
import { LeaveMatchmakingUseCase } from '../matchmaking/usecases/leaveMatchmaking.usecase';
import { RunMatchmakingUseCase } from '../matchmaking/usecases/runMatchmaking.usecase';
import type { AuthSession } from '../auth/entities/session.entity';
import { CancelGameUseCase } from '../game/usecases/cancelGame.usecase';
import { GameMapper } from '../game/mappers/game.mapper';
import { GamePlayerMapper } from '../game/mappers/gamePlayer.mapper';
import { GetSessionUserUseCase } from '../auth/usecases/getSessionUser.usecase';
import { UserMapper } from '../users/mappers/user.mapper';
import { GetMatchmakingsUsecase } from '../matchmaking/usecases/getMatchmakings.usecase';
import { MatchmakingMapper } from '../matchmaking/mappers/matchmaking.mapper';
import { DeckReadRepository, DeckRepository } from '../deck/repositories/deck.repository';
import { CardReadRepository, CardRepository } from '../card/repositories/card.repository';
import { CardMapper } from '../card/mappers/card.mapper';
import { GrantPremadeDeckUseCase } from '../deck/usecases/grantPremadeDeck';
import { GetMyCollectionUseCase } from '../card/usecases/getMyCollection.usecase';
import { eventEmitter } from './eventEmitter';
import { DeckSubscribers } from '../deck/deck.subscribers';
import { GetDecksUseCase } from '../deck/usecases/getDecks.usecase';
import { DeckMapper } from '../deck/mappers/deck.mapper';
import { CreateDeckUseCase } from '../deck/usecases/createDeck.usecase';
import { UpdateDeckUseCase } from '../deck/usecases/updateDeck.usecase';
import { SetupRankedGameUsecase } from '../game/usecases/setupRankedGame.usecase';
import { GameSubscribers } from '../game/game.subscribers';
import { StartGameUseCase } from '../game/usecases/startGame.usecase';
import { GetLatestGamesUseCase } from '../game/usecases/getLatestGames.usecase';
import { GetGameInfosUseCase } from '../game/usecases/getGameInfos.usecase';

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
      // Resolve eager dependencies immediately, to start domain event subscribers etc
      container.resolve(key);
    });

  return container;
};

const makeQueryDependencies = (ctx: QueryCtxWithSession) => {
  const deps = {
    db: { resolver: asValue(ctx.db) },
    session: { resolver: asValue(ctx.session as AuthSession | null) },
    // repositories
    [SessionReadRepository.INJECTION_KEY]: { resolver: asClass(SessionReadRepository) },
    [UserReadRepository.INJECTION_KEY]: { resolver: asClass(UserReadRepository) },
    [GameReadRepository.INJECTION_KEY]: { resolver: asClass(GameReadRepository) },
    [GamePlayerReadRepository.INJECTION_KEY]: {
      resolver: asClass(GamePlayerReadRepository)
    },
    [MatchmakingReadRepository.INJECTION_KEY]: {
      resolver: asClass(MatchmakingReadRepository)
    },
    [MatchmakingUserReadRepository.INJECTION_KEY]: {
      resolver: asClass(MatchmakingUserReadRepository)
    },
    [DeckReadRepository.INJECTION_KEY]: { resolver: asClass(DeckReadRepository) },
    [CardReadRepository.INJECTION_KEY]: { resolver: asClass(CardReadRepository) },
    // mappers
    [GameMapper.INJECTION_KEY]: { resolver: asClass(GameMapper) },
    [GamePlayerMapper.INJECTION_KEY]: { resolver: asClass(GamePlayerMapper) },
    [UserMapper.INJECTION_KEY]: { resolver: asClass(UserMapper) },
    [CardMapper.INJECTION_KEY]: { resolver: asClass(CardMapper) },
    [MatchmakingMapper.INJECTION_KEY]: { resolver: asClass(MatchmakingMapper) },
    [DeckMapper.INJECTION_KEY]: { resolver: asClass(DeckMapper) },

    // use cases
    [GetSessionUserUseCase.INJECTION_KEY]: { resolver: asClass(GetSessionUserUseCase) },
    [GetMatchmakingsUsecase.INJECTION_KEY]: { resolver: asClass(GetMatchmakingsUsecase) },
    [GetMyCollectionUseCase.INJECTION_KEY]: { resolver: asClass(GetMyCollectionUseCase) },
    [GetDecksUseCase.INJECTION_KEY]: { resolver: asClass(GetDecksUseCase) },
    [GetLatestGamesUseCase.INJECTION_KEY]: { resolver: asClass(GetLatestGamesUseCase) },
    [GetGameInfosUseCase.INJECTION_KEY]: { resolver: asClass(GetGameInfosUseCase) }
  } as const satisfies DependenciesMap;

  return deps;
};

export const createQueryContainer = (ctx: QueryCtxWithSession) => {
  return makecontainer(makeQueryDependencies(ctx));
};

const makeMutationDependencies = (ctx: MutationCtxWithSession) => {
  const deps = {
    nodeName: { resolver: asValue(null) }, // there is a very weird bug in awilix when using in convex where it tries to resolve the nodeName dependency, this is a workaround
    db: { resolver: asValue(ctx.db) },
    session: { resolver: asValue(ctx.session) },
    scheduler: { resolver: asValue(ctx.scheduler) },
    eventEmitter: { resolver: asValue(eventEmitter) },
    // repositories
    [SessionRepository.INJECTION_KEY]: { resolver: asClass(SessionRepository) },
    [UserRepository.INJECTION_KEY]: { resolver: asClass(UserRepository) },
    [GameRepository.INJECTION_KEY]: { resolver: asClass(GameRepository) },
    [GamePlayerRepository.INJECTION_KEY]: { resolver: asClass(GamePlayerRepository) },
    [MatchmakingRepository.INJECTION_KEY]: { resolver: asClass(MatchmakingRepository) },
    [MatchmakingUserRepository.INJECTION_KEY]: {
      resolver: asClass(MatchmakingUserRepository)
    },
    [DeckRepository.INJECTION_KEY]: { resolver: asClass(DeckRepository) },
    [CardRepository.INJECTION_KEY]: { resolver: asClass(CardRepository) },
    // mappers
    [GameMapper.INJECTION_KEY]: { resolver: asClass(GameMapper) },
    [GamePlayerMapper.INJECTION_KEY]: { resolver: asClass(GamePlayerMapper) },
    [UserMapper.INJECTION_KEY]: { resolver: asClass(UserMapper) },
    [CardMapper.INJECTION_KEY]: { resolver: asClass(CardMapper) },
    [MatchmakingMapper.INJECTION_KEY]: { resolver: asClass(MatchmakingMapper) },
    [DeckMapper.INJECTION_KEY]: { resolver: asClass(DeckMapper) },
    // subscribers
    [DeckSubscribers.INJECTION_KEY]: { resolver: asClass(DeckSubscribers), eager: true },
    [GameSubscribers.INJECTION_KEY]: { resolver: asClass(GameSubscribers), eager: true },
    // use cases
    [LoginUseCase.INJECTION_KEY]: { resolver: asClass(LoginUseCase) },
    [LogoutUseCase.INJECTION_KEY]: { resolver: asClass(LogoutUseCase) },
    [RegisterUseCase.INJECTION_KEY]: { resolver: asClass(RegisterUseCase) },
    [JoinMatchmakingUseCase.INJECTION_KEY]: { resolver: asClass(JoinMatchmakingUseCase) },
    [LeaveMatchmakingUseCase.INJECTION_KEY]: {
      resolver: asClass(LeaveMatchmakingUseCase)
    },
    [RunMatchmakingUseCase.INJECTION_KEY]: { resolver: asClass(RunMatchmakingUseCase) },
    [CancelGameUseCase.INJECTION_KEY]: { resolver: asClass(CancelGameUseCase) },
    [StartGameUseCase.INJECTION_KEY]: { resolver: asClass(StartGameUseCase) },
    [GrantPremadeDeckUseCase.INJECTION_KEY]: {
      resolver: asClass(GrantPremadeDeckUseCase)
    },
    [CreateDeckUseCase.INJECTION_KEY]: { resolver: asClass(CreateDeckUseCase) },
    [UpdateDeckUseCase.INJECTION_KEY]: { resolver: asClass(UpdateDeckUseCase) },
    [SetupRankedGameUsecase.INJECTION_KEY]: { resolver: asClass(SetupRankedGameUsecase) }
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
