import { asClass } from 'awilix';
import {
  MatchmakingReadRepository,
  MatchmakingRepository
} from './repositories/matchmaking.repository';
import {
  MatchmakingUserReadRepository,
  MatchmakingUserRepository
} from './repositories/matchmakingUser.repository';
import { JoinMatchmakingUseCase } from './usecases/joinMatchmaking.usecase';
import { LeaveMatchmakingUseCase } from './usecases/leaveMatchmaking.usecase';
import { RunMatchmakingUseCase } from './usecases/runMatchmaking.usecase';
import { GetMatchmakingsUsecase } from './usecases/getMatchmakings.usecase';
import { MatchmakingMapper } from './mappers/matchmaking.mapper';
import { MatchmakingSubscribers } from './matchmaking.subscribers';
import { KickFromMatchmakingUseCase } from './usecases/kickFromMatchmaking.usecase';
import type { DependenciesMap } from '../shared/container';

export const queryDependencies = {
  [MatchmakingReadRepository.INJECTION_KEY]: {
    resolver: asClass(MatchmakingReadRepository)
  },
  [MatchmakingUserReadRepository.INJECTION_KEY]: {
    resolver: asClass(MatchmakingUserReadRepository)
  },
  [MatchmakingMapper.INJECTION_KEY]: { resolver: asClass(MatchmakingMapper) },
  [GetMatchmakingsUsecase.INJECTION_KEY]: { resolver: asClass(GetMatchmakingsUsecase) }
} as const satisfies DependenciesMap;

export const mutationDependencies = {
  [MatchmakingRepository.INJECTION_KEY]: { resolver: asClass(MatchmakingRepository) },
  [MatchmakingUserRepository.INJECTION_KEY]: {
    resolver: asClass(MatchmakingUserRepository)
  },
  [MatchmakingMapper.INJECTION_KEY]: { resolver: asClass(MatchmakingMapper) },
  [MatchmakingSubscribers.INJECTION_KEY]: {
    resolver: asClass(MatchmakingSubscribers),
    eager: true
  },
  [JoinMatchmakingUseCase.INJECTION_KEY]: { resolver: asClass(JoinMatchmakingUseCase) },
  [LeaveMatchmakingUseCase.INJECTION_KEY]: {
    resolver: asClass(LeaveMatchmakingUseCase)
  },
  [KickFromMatchmakingUseCase.INJECTION_KEY]: {
    resolver: asClass(KickFromMatchmakingUseCase)
  },
  [RunMatchmakingUseCase.INJECTION_KEY]: { resolver: asClass(RunMatchmakingUseCase) }
} as const satisfies DependenciesMap;
