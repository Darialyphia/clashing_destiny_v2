import { asClass } from 'awilix';
import { CardReadRepository, CardRepository } from './repositories/card.repository';
import { CardMapper } from './mappers/card.mapper';
import { GetMyCollectionUseCase } from './usecases/getMyCollection.usecase';
import { GrantMissingCardsUseCase } from './usecases/grantMissingCards.usecase';
import { BoosterPackReadRepository } from './repositories/booster-pack-read.repository';
import { BoosterPackRepository } from './repositories/booster-pack.repository';
import { GetUnopenedPacksUseCase } from './usecases/getUnopenedPacks.usecase';
import { PurchaseBoosterPacksUseCase } from './usecases/purchaseBoosterPacks.usecase';
import { OpenBoosterPackUseCase } from './usecases/openBoosterPack.usecase';
import { CraftCardUseCase } from './usecases/craftCard.usecase';
import { DecraftCardUseCase } from './usecases/decraftCard.usecase';
import { DecraftExtraCardsUseCase } from './usecases/decraftExtraCards.usecase';
import type { DependenciesMap } from '../shared/container';
import { BoosterPackMapper } from './mappers/boosterPack.mapper';

export const queryDependencies = {
  [CardReadRepository.INJECTION_KEY]: { resolver: asClass(CardReadRepository) },
  [CardMapper.INJECTION_KEY]: { resolver: asClass(CardMapper) },
  [GetMyCollectionUseCase.INJECTION_KEY]: { resolver: asClass(GetMyCollectionUseCase) },
  [BoosterPackReadRepository.INJECTION_KEY]: {
    resolver: asClass(BoosterPackReadRepository)
  },
  [GetUnopenedPacksUseCase.INJECTION_KEY]: { resolver: asClass(GetUnopenedPacksUseCase) }
} as const satisfies DependenciesMap;

export const mutationDependencies = {
  [CardRepository.INJECTION_KEY]: { resolver: asClass(CardRepository) },
  [CardMapper.INJECTION_KEY]: { resolver: asClass(CardMapper) },
  [GrantMissingCardsUseCase.INJECTION_KEY]: {
    resolver: asClass(GrantMissingCardsUseCase)
  },
  [BoosterPackRepository.INJECTION_KEY]: { resolver: asClass(BoosterPackRepository) },
  [BoosterPackReadRepository.INJECTION_KEY]: {
    resolver: asClass(BoosterPackReadRepository)
  },
  [PurchaseBoosterPacksUseCase.INJECTION_KEY]: {
    resolver: asClass(PurchaseBoosterPacksUseCase)
  },
  [OpenBoosterPackUseCase.INJECTION_KEY]: { resolver: asClass(OpenBoosterPackUseCase) },
  [CraftCardUseCase.INJECTION_KEY]: { resolver: asClass(CraftCardUseCase) },
  [DecraftCardUseCase.INJECTION_KEY]: { resolver: asClass(DecraftCardUseCase) },
  [DecraftExtraCardsUseCase.INJECTION_KEY]: {
    resolver: asClass(DecraftExtraCardsUseCase)
  },
  [BoosterPackMapper.INJECTION_KEY]: { resolver: asClass(BoosterPackMapper) }
} as const satisfies DependenciesMap;
