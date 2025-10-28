import { asClass } from 'awilix';
import { CardReadRepository, CardRepository } from './repositories/card.repository';
import { CardMapper } from './mappers/card.mapper';
import { GetMyCollectionUseCase } from './usecases/getMyCollection.usecase';
import { GrantMissingCardsUseCase } from './usecases/grantMissingCards.usecase';
import type { DependenciesMap } from '../shared/container';

export const queryDependencies = {
  [CardReadRepository.INJECTION_KEY]: { resolver: asClass(CardReadRepository) },
  [CardMapper.INJECTION_KEY]: { resolver: asClass(CardMapper) },
  [GetMyCollectionUseCase.INJECTION_KEY]: { resolver: asClass(GetMyCollectionUseCase) }
} as const satisfies DependenciesMap;

export const mutationDependencies = {
  [CardRepository.INJECTION_KEY]: { resolver: asClass(CardRepository) },
  [CardMapper.INJECTION_KEY]: { resolver: asClass(CardMapper) },
  [GrantMissingCardsUseCase.INJECTION_KEY]: {
    resolver: asClass(GrantMissingCardsUseCase)
  }
} as const satisfies DependenciesMap;
