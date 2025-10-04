import { asClass, asValue, createContainer, InjectionMode } from 'awilix';
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
import type { DatabaseReader, DatabaseWriter } from '../_generated/server';
import type { AuthSession } from '../auth/entities/session.entity';
import type { Scheduler } from 'convex/server';
import { CancelGameUseCase } from '../game/usecases/cancelGame.usecase';
import { GameMapper } from '../game/mappers/game.mapper';
import { GamePlayerMapper } from '../game/mappers/gamePlayer.mapper';
import { GetSessionUserUseCase } from '../auth/usecases/getSessionUser.usecase';
import { UserMapper } from '../users/mappers/user.mapper';
import { GetMatchmakingsUsecase } from '../matchmaking/usecases/getMatchmakings.usecase';
import { MatchmakingMapper } from '../matchmaking/mappers/matchmaking.mapper';
import { DeckReadRepository, DeckRepository } from '../deck/repositories/deck.repository';

export type QueryContainer = {
  db: DatabaseReader;
  session: AuthSession | null;
  [SessionReadRepository.INJECTION_KEY]: SessionReadRepository;
  [UserReadRepository.INJECTION_KEY]: UserReadRepository;
  [GameReadRepository.INJECTION_KEY]: GameReadRepository;
  [GamePlayerReadRepository.INJECTION_KEY]: GamePlayerReadRepository;
  [MatchmakingReadRepository.INJECTION_KEY]: MatchmakingReadRepository;
  [MatchmakingUserReadRepository.INJECTION_KEY]: MatchmakingUserReadRepository;
  [GameMapper.INJECTION_KEY]: GameMapper;
  [GamePlayerMapper.INJECTION_KEY]: GamePlayerMapper;
  [UserMapper.INJECTION_KEY]: UserMapper;
  [GetSessionUserUseCase.INJECTION_KEY]: GetSessionUserUseCase;
  [GetMatchmakingsUsecase.INJECTION_KEY]: GetMatchmakingsUsecase;
  [MatchmakingMapper.INJECTION_KEY]: MatchmakingMapper;
  [DeckReadRepository.INJECTION_KEY]: DeckReadRepository;
};

export const createQueryContainer = (ctx: QueryCtxWithSession) => {
  const container = createContainer<QueryContainer>({
    injectionMode: InjectionMode.PROXY
  });

  container.register({
    db: asValue(ctx.db),
    session: asValue(ctx.session),
    [SessionReadRepository.INJECTION_KEY]: asClass(SessionReadRepository),
    [UserReadRepository.INJECTION_KEY]: asClass(UserReadRepository),
    [GameReadRepository.INJECTION_KEY]: asClass(GameReadRepository),
    [GamePlayerReadRepository.INJECTION_KEY]: asClass(GamePlayerReadRepository),
    [MatchmakingReadRepository.INJECTION_KEY]: asClass(MatchmakingReadRepository),
    [MatchmakingUserReadRepository.INJECTION_KEY]: asClass(MatchmakingUserReadRepository),
    [GameMapper.INJECTION_KEY]: asClass(GameMapper),
    [GamePlayerMapper.INJECTION_KEY]: asClass(GamePlayerMapper),
    [UserMapper.INJECTION_KEY]: asClass(UserMapper),
    [GetSessionUserUseCase.INJECTION_KEY]: asClass(GetSessionUserUseCase),
    [GetMatchmakingsUsecase.INJECTION_KEY]: asClass(GetMatchmakingsUsecase),
    [MatchmakingMapper.INJECTION_KEY]: asClass(MatchmakingMapper),
    [DeckReadRepository.INJECTION_KEY]: asClass(DeckReadRepository)
  });

  return container;
};

export type MutationContainer = {
  db: DatabaseWriter;
  session: AuthSession;
  scheduler: Scheduler;
  [SessionRepository.INJECTION_KEY]: SessionRepository;
  [UserRepository.INJECTION_KEY]: UserRepository;
  [GameRepository.INJECTION_KEY]: GameRepository;
  [GamePlayerRepository.INJECTION_KEY]: GamePlayerRepository;
  [MatchmakingRepository.INJECTION_KEY]: MatchmakingRepository;
  [MatchmakingUserRepository.INJECTION_KEY]: MatchmakingUserRepository;
  [LoginUseCase.INJECTION_KEY]: LoginUseCase;
  [LogoutUseCase.INJECTION_KEY]: LogoutUseCase;
  [RegisterUseCase.INJECTION_KEY]: RegisterUseCase;
  [JoinMatchmakingUseCase.INJECTION_KEY]: JoinMatchmakingUseCase;
  [LeaveMatchmakingUseCase.INJECTION_KEY]: LeaveMatchmakingUseCase;
  [RunMatchmakingUseCase.INJECTION_KEY]: RunMatchmakingUseCase;
  [CancelGameUseCase.INJECTION_KEY]: CancelGameUseCase;
  [GameMapper.INJECTION_KEY]: GameMapper;
  [UserMapper.INJECTION_KEY]: UserMapper;
  [GamePlayerMapper.INJECTION_KEY]: GamePlayerMapper;
  [MatchmakingMapper.INJECTION_KEY]: MatchmakingMapper;
  [DeckRepository.INJECTION_KEY]: DeckRepository;
};
export const createMutationContainer = (ctx: MutationCtxWithSession) => {
  const container = createContainer({
    injectionMode: InjectionMode.PROXY
  });

  container.register({
    db: asValue(ctx.db),
    session: asValue(ctx.session),
    scheduler: asValue(ctx.scheduler),
    [SessionRepository.INJECTION_KEY]: asClass(SessionRepository),
    [UserRepository.INJECTION_KEY]: asClass(UserRepository),
    [GameRepository.INJECTION_KEY]: asClass(GameRepository),
    [GamePlayerRepository.INJECTION_KEY]: asClass(GamePlayerRepository),
    [MatchmakingRepository.INJECTION_KEY]: asClass(MatchmakingRepository),
    [MatchmakingUserRepository.INJECTION_KEY]: asClass(MatchmakingUserRepository),
    [LoginUseCase.INJECTION_KEY]: asClass(LoginUseCase),
    [LogoutUseCase.INJECTION_KEY]: asClass(LogoutUseCase),
    [RegisterUseCase.INJECTION_KEY]: asClass(RegisterUseCase),
    [JoinMatchmakingUseCase.INJECTION_KEY]: asClass(JoinMatchmakingUseCase),
    [LeaveMatchmakingUseCase.INJECTION_KEY]: asClass(LeaveMatchmakingUseCase),
    [RunMatchmakingUseCase.INJECTION_KEY]: asClass(RunMatchmakingUseCase),
    [CancelGameUseCase.INJECTION_KEY]: asClass(CancelGameUseCase),
    [GameMapper.INJECTION_KEY]: asClass(GameMapper),
    [GamePlayerMapper.INJECTION_KEY]: asClass(GamePlayerMapper),
    [UserMapper.INJECTION_KEY]: asClass(UserMapper),
    [MatchmakingMapper.INJECTION_KEY]: asClass(MatchmakingMapper),
    [DeckRepository.INJECTION_KEY]: asClass(DeckRepository)
  });

  return container;
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
