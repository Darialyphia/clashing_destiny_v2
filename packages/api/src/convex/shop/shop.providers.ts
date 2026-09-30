import { asClass } from 'awilix';
import type { DependenciesMap } from '../shared/container';
import { GetCatalogByCategoryUseCase } from './usecases/getCatalogByCategory.usecase';
import { PurchaseItemUseCase } from './usecases/purchaseItem.usecase';

export const queryDependencies = {
  [GetCatalogByCategoryUseCase.INJECTION_KEY]: {
    resolver: asClass(GetCatalogByCategoryUseCase)
  }
} as const satisfies DependenciesMap;

export const mutationDependencies = {
  [PurchaseItemUseCase.INJECTION_KEY]: {
    resolver: asClass(PurchaseItemUseCase)
  }
} as const satisfies DependenciesMap;
