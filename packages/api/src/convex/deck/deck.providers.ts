import { asClass } from 'awilix';
import { DeckReadRepository, DeckRepository } from './repositories/deck.repository';
import { GrantPremadeDeckUseCase } from './usecases/grantPremadeDeck';
import { DeckSubscribers } from './deck.subscribers';
import { GetDecksUseCase } from './usecases/getDecks.usecase';
import { DeckMapper } from './mappers/deck.mapper';
import { CreateDeckUseCase } from './usecases/createDeck.usecase';
import { UpdateDeckUseCase } from './usecases/updateDeck.usecase';
import { DeleteDeckUseCase } from './usecases/deleteDeck.usecase';
import type { DependenciesMap } from '../shared/container';

export const queryDependencies = {
  [DeckReadRepository.INJECTION_KEY]: { resolver: asClass(DeckReadRepository) },
  [DeckMapper.INJECTION_KEY]: { resolver: asClass(DeckMapper) },
  [GetDecksUseCase.INJECTION_KEY]: { resolver: asClass(GetDecksUseCase) }
} as const satisfies DependenciesMap;

export const mutationDependencies = {
  [DeckRepository.INJECTION_KEY]: { resolver: asClass(DeckRepository) },
  [DeckMapper.INJECTION_KEY]: { resolver: asClass(DeckMapper) },
  [DeckSubscribers.INJECTION_KEY]: { resolver: asClass(DeckSubscribers), eager: true },
  [GrantPremadeDeckUseCase.INJECTION_KEY]: {
    resolver: asClass(GrantPremadeDeckUseCase)
  },
  [CreateDeckUseCase.INJECTION_KEY]: { resolver: asClass(CreateDeckUseCase) },
  [UpdateDeckUseCase.INJECTION_KEY]: { resolver: asClass(UpdateDeckUseCase) },
  [DeleteDeckUseCase.INJECTION_KEY]: { resolver: asClass(DeleteDeckUseCase) }
} as const satisfies DependenciesMap;
