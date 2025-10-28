import { asClass } from 'awilix';
import { GiftReadRepository, GiftRepository } from './repositories/gift.repository';
import { GiftMapper } from './mappers/gift.mapper';
import { GiveGiftUseCase } from './usecases/giveGift.usecase';
import { ClaimGiftUseCase } from './usecases/claimGift.usecase';
import { GetMyGiftsUseCase } from './usecases/getMyGifts.usecase';
import type { DependenciesMap } from '../shared/container';

export const queryDependencies = {
  [GiftReadRepository.INJECTION_KEY]: { resolver: asClass(GiftReadRepository) },
  [GetMyGiftsUseCase.INJECTION_KEY]: { resolver: asClass(GetMyGiftsUseCase) }
} as const satisfies DependenciesMap;

export const mutationDependencies = {
  [GiftRepository.INJECTION_KEY]: { resolver: asClass(GiftRepository) },
  [GiftMapper.INJECTION_KEY]: { resolver: asClass(GiftMapper) },
  [GiveGiftUseCase.INJECTION_KEY]: { resolver: asClass(GiveGiftUseCase) },
  [ClaimGiftUseCase.INJECTION_KEY]: { resolver: asClass(ClaimGiftUseCase) }
} as const satisfies DependenciesMap;
