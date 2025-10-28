import { asClass } from 'awilix';
import {
  FriendRequestReadRepository,
  FriendRequestRepository
} from './repositories/friendRequest.repository';
import { FriendRequestMapper } from './mappers/friendRequest.mapper';
import { FriendlyChallengeMapper } from './mappers/friendlyChallenge.mapper';
import {
  FriendlyChallengeReadRepository,
  FriendlyChallengeRepository
} from './repositories/friendlyChallenge.repository';
import { DeclineFriendRequestUseCase } from './usecases/declineFriendRequest.usecase';
import { GetFriendsUseCase } from './usecases/getFriends.usecase';
import { MarkFriendRequestAsSeenUseCase } from './usecases/markFriendRequestAsSeen.usecase';
import { GetPendingRequestsUseCase } from './usecases/getPendingRequests.usecase';
import { SendFriendRequestUseCase } from './usecases/sendFriendRequest.usecase';
import { AcceptFriendRequestUseCase } from './usecases/acceptFriendRequest.usecase';
import { SendFriendlyChallengeRequestUseCase } from './usecases/sendFriendlyChallengeRequest.usecase';
import { CancelFriendlyChallengeRequestUseCase } from './usecases/cancelFriendlyChallengeRequest.usecase';
import { AcceptFriendlyChallengeUseCase } from './usecases/acceptFriendlyChallenge.usecase';
import { DeclineFriendlyChallengeUseCase } from './usecases/declineFriendlyChallenge.usecase';
import { ClearAllPendingChallengesUseCase } from './usecases/clearAllPendingChallenges.usecase';
import type { DependenciesMap } from '../shared/container';

export const queryDependencies = {
  [FriendRequestReadRepository.INJECTION_KEY]: {
    resolver: asClass(FriendRequestReadRepository)
  },
  [FriendlyChallengeReadRepository.INJECTION_KEY]: {
    resolver: asClass(FriendlyChallengeReadRepository)
  },
  [FriendRequestMapper.INJECTION_KEY]: { resolver: asClass(FriendRequestMapper) },
  [FriendlyChallengeMapper.INJECTION_KEY]: {
    resolver: asClass(FriendlyChallengeMapper)
  },
  [GetFriendsUseCase.INJECTION_KEY]: { resolver: asClass(GetFriendsUseCase) },
  [GetPendingRequestsUseCase.INJECTION_KEY]: {
    resolver: asClass(GetPendingRequestsUseCase)
  }
} as const satisfies DependenciesMap;

export const mutationDependencies = {
  [FriendRequestRepository.INJECTION_KEY]: {
    resolver: asClass(FriendRequestRepository)
  },
  [FriendlyChallengeRepository.INJECTION_KEY]: {
    resolver: asClass(FriendlyChallengeRepository)
  },
  [FriendRequestMapper.INJECTION_KEY]: { resolver: asClass(FriendRequestMapper) },
  [FriendlyChallengeMapper.INJECTION_KEY]: {
    resolver: asClass(FriendlyChallengeMapper)
  },
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
  }
} as const satisfies DependenciesMap;
