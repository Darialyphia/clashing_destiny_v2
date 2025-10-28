import { asClass } from 'awilix';
import { UserReadRepository, UserRepository } from './repositories/user.repository';
import { UserMapper } from './mappers/user.mapper';
import type { DependenciesMap } from '../shared/container';

export const queryDependencies = {
  [UserReadRepository.INJECTION_KEY]: { resolver: asClass(UserReadRepository) },
  [UserMapper.INJECTION_KEY]: { resolver: asClass(UserMapper) }
} as const satisfies DependenciesMap;

export const mutationDependencies = {
  [UserRepository.INJECTION_KEY]: { resolver: asClass(UserRepository) },
  [UserMapper.INJECTION_KEY]: { resolver: asClass(UserMapper) }
} as const satisfies DependenciesMap;
