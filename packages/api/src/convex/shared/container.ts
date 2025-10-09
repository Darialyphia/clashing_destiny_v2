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
import { FinishGameUseCase } from '../game/usecases/finishGame.usecase';
import {
  FriendRequestReadRepository,
  FriendRequestRepository
} from '../friend/repositories/friendRequest.repository';
import { FriendRequestMapper } from '../friend/mappers/friendRequest.mapper';
import { FriendlyChallengeMapper } from '../friend/mappers/friendlyChallenge.mapper';
import {
  FriendlyChallengeReadRepository,
  FriendlyChallengeRepository
} from '../friend/repositories/friendlyChallenge.repository';
import { DeclineFriendRequestUseCase } from '../friend/usecases/declineFriendRequest.usecase';
import { GetFriendsUseCase } from '../friend/usecases/getFriends.usecase';
import { MarkFriendRequestAsSeenUseCase } from '../friend/usecases/markFriendRequestAsSeen.usecase';
import { GetPendingRequestsUseCase } from '../friend/usecases/getPendingRequests.usecase';
import { SendFriendRequestUseCase } from '../friend/usecases/sendFriendRequest.usecase';
import { AcceptFriendRequestUseCase } from '../friend/usecases/acceptFriendRequest.usecase';
import { SendFriendlyChallengeRequestUseCase } from '../friend/usecases/sendFriendlyChallengeRequest.usecase';
import { CancelFriendlyChallengeRequestUseCase } from '../friend/usecases/cancelFriendlyChallengeRequest.usecase';
import { AcceptFriendlyChallengeUseCase } from '../friend/usecases/acceptFriendlyChallenge.usecase';
import { DeclineFriendlyChallengeUseCase } from '../friend/usecases/declineFriendlyChallenge.usecase';
import { ClearAllPendingChallengesUseCase } from '../friend/usecases/clearAllPendingChallenges.usecase';
import {
  LobbyReadRepository,
  LobbyRepository
} from '../lobby/repositories/lobby.repository';
import {
  LobbyUserReadRepository,
  LobbyUserRepository
} from '../lobby/repositories/lobbyUser.repository';
import { LobbyMapper } from '../lobby/mappers/lobby.mapper';
import { LobbyUserMapper } from '../lobby/mappers/lobbyUser.mapper';
import { CreateLobbyUseCase } from '../lobby/usecases/createLobby.usecase';
import { JoinLobbyUseCase } from '../lobby/usecases/joinLobby.usecase';
import { LeaveLobbyUseCase } from '../lobby/usecases/leaveLobby.usecase';
import { SelectDeckForLobbyUseCase } from '../lobby/usecases/selectDeckForLobby.usecase';
import { ChangeLobbyUserRoleUseCase } from '../lobby/usecases/changeLobbyUserRole.usecase';

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
    [FriendRequestReadRepository.INJECTION_KEY]: {
      resolver: asClass(FriendRequestReadRepository)
    },
    [FriendlyChallengeReadRepository.INJECTION_KEY]: {
      resolver: asClass(FriendlyChallengeReadRepository)
    },
    [LobbyReadRepository.INJECTION_KEY]: {
      resolver: asClass(LobbyReadRepository)
    },
    [LobbyUserReadRepository.INJECTION_KEY]: {
      resolver: asClass(LobbyUserReadRepository)
    },
    // mappers
    [GameMapper.INJECTION_KEY]: { resolver: asClass(GameMapper) },
    [GamePlayerMapper.INJECTION_KEY]: { resolver: asClass(GamePlayerMapper) },
    [UserMapper.INJECTION_KEY]: { resolver: asClass(UserMapper) },
    [CardMapper.INJECTION_KEY]: { resolver: asClass(CardMapper) },
    [MatchmakingMapper.INJECTION_KEY]: { resolver: asClass(MatchmakingMapper) },
    [DeckMapper.INJECTION_KEY]: { resolver: asClass(DeckMapper) },
    [FriendRequestMapper.INJECTION_KEY]: { resolver: asClass(FriendRequestMapper) },
    [FriendlyChallengeMapper.INJECTION_KEY]: {
      resolver: asClass(FriendlyChallengeMapper)
    },
    [LobbyMapper.INJECTION_KEY]: { resolver: asClass(LobbyMapper) },
    [LobbyUserMapper.INJECTION_KEY]: { resolver: asClass(LobbyUserMapper) },

    // use cases
    [GetSessionUserUseCase.INJECTION_KEY]: { resolver: asClass(GetSessionUserUseCase) },
    [GetMatchmakingsUsecase.INJECTION_KEY]: { resolver: asClass(GetMatchmakingsUsecase) },
    [GetMyCollectionUseCase.INJECTION_KEY]: { resolver: asClass(GetMyCollectionUseCase) },
    [GetDecksUseCase.INJECTION_KEY]: { resolver: asClass(GetDecksUseCase) },
    [GetLatestGamesUseCase.INJECTION_KEY]: { resolver: asClass(GetLatestGamesUseCase) },
    [GetGameInfosUseCase.INJECTION_KEY]: { resolver: asClass(GetGameInfosUseCase) },
    [GetFriendsUseCase.INJECTION_KEY]: { resolver: asClass(GetFriendsUseCase) },
    [GetPendingRequestsUseCase.INJECTION_KEY]: {
      resolver: asClass(GetPendingRequestsUseCase)
    }
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
    [FriendRequestRepository.INJECTION_KEY]: {
      resolver: asClass(FriendRequestRepository)
    },
    [FriendlyChallengeRepository.INJECTION_KEY]: {
      resolver: asClass(FriendlyChallengeRepository)
    },
    [LobbyRepository.INJECTION_KEY]: { resolver: asClass(LobbyRepository) },
    [LobbyUserRepository.INJECTION_KEY]: { resolver: asClass(LobbyUserRepository) },
    // mappers
    [GameMapper.INJECTION_KEY]: { resolver: asClass(GameMapper) },
    [GamePlayerMapper.INJECTION_KEY]: { resolver: asClass(GamePlayerMapper) },
    [UserMapper.INJECTION_KEY]: { resolver: asClass(UserMapper) },
    [CardMapper.INJECTION_KEY]: { resolver: asClass(CardMapper) },
    [MatchmakingMapper.INJECTION_KEY]: { resolver: asClass(MatchmakingMapper) },
    [DeckMapper.INJECTION_KEY]: { resolver: asClass(DeckMapper) },
    [FriendRequestMapper.INJECTION_KEY]: { resolver: asClass(FriendRequestMapper) },
    [FriendlyChallengeMapper.INJECTION_KEY]: {
      resolver: asClass(FriendlyChallengeMapper)
    },
    [LobbyMapper.INJECTION_KEY]: { resolver: asClass(LobbyMapper) },
    [LobbyUserMapper.INJECTION_KEY]: { resolver: asClass(LobbyUserMapper) },
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
    [FinishGameUseCase.INJECTION_KEY]: { resolver: asClass(FinishGameUseCase) },
    [GrantPremadeDeckUseCase.INJECTION_KEY]: {
      resolver: asClass(GrantPremadeDeckUseCase)
    },
    [CreateDeckUseCase.INJECTION_KEY]: { resolver: asClass(CreateDeckUseCase) },
    [UpdateDeckUseCase.INJECTION_KEY]: { resolver: asClass(UpdateDeckUseCase) },
    [SetupRankedGameUsecase.INJECTION_KEY]: { resolver: asClass(SetupRankedGameUsecase) },
    [SendFriendRequestUseCase.INJECTION_KEY]: {
      resolver: asClass(SendFriendRequestUseCase)
    },
    [AcceptFriendRequestUseCase.INJECTION_KEY]: {
      resolver: asClass(AcceptFriendRequestUseCase)
    },
    [DeclineFriendRequestUseCase.INJECTION_KEY]: {
      resolver: asClass(DeclineFriendRequestUseCase)
    },
    [MarkFriendRequestAsSeenUseCase.INJECTION_KEY]: {
      resolver: asClass(MarkFriendRequestAsSeenUseCase)
    },
    [SendFriendlyChallengeRequestUseCase.INJECTION_KEY]: {
      resolver: asClass(SendFriendlyChallengeRequestUseCase)
    },
    [CancelFriendlyChallengeRequestUseCase.INJECTION_KEY]: {
      resolver: asClass(CancelFriendlyChallengeRequestUseCase)
    },
    [AcceptFriendlyChallengeUseCase.INJECTION_KEY]: {
      resolver: asClass(AcceptFriendlyChallengeUseCase)
    },
    [DeclineFriendlyChallengeUseCase.INJECTION_KEY]: {
      resolver: asClass(DeclineFriendlyChallengeUseCase)
    },
    [ClearAllPendingChallengesUseCase.INJECTION_KEY]: {
      resolver: asClass(ClearAllPendingChallengesUseCase)
    },
    [CreateLobbyUseCase.INJECTION_KEY]: { resolver: asClass(CreateLobbyUseCase) },
    [JoinLobbyUseCase.INJECTION_KEY]: { resolver: asClass(JoinLobbyUseCase) },
    [LeaveLobbyUseCase.INJECTION_KEY]: { resolver: asClass(LeaveLobbyUseCase) },
    [SelectDeckForLobbyUseCase.INJECTION_KEY]: {
      resolver: asClass(SelectDeckForLobbyUseCase)
    },
    [ChangeLobbyUserRoleUseCase.INJECTION_KEY]: {
      resolver: asClass(ChangeLobbyUserRoleUseCase)
    }
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
