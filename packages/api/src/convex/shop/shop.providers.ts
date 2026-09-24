import { asClass } from 'awilix';
import type { DependenciesMap } from '../shared/container';
import { GetCatalogByCategoryUseCase } from './usecases/getCatalogByCategory.usecase';

export const queryDependencies = {
  [GetCatalogByCategoryUseCase.INJECTION_KEY]: {
    resolver: asClass(GetCatalogByCategoryUseCase)
  }
} as const satisfies DependenciesMap;

export const mutationDependencies = {} as const satisfies DependenciesMap;
