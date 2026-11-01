import { asClass } from 'awilix';
import { UserReadRepository, UserRepository } from './repositories/user.repository';
import {
  UserSettingsReadRepository,
  UserSettingsRepository
} from './repositories/userSettings.repository';
import { UserMapper } from './mappers/user.mapper';
import { GetUserSettingsUseCase } from './usecases/getUserSettings.usecase';
import { SaveUserSettingsUseCase } from './usecases/saveUserSettings.usecase';
import type { DependenciesMap } from '../shared/container';

export const queryDependencies = {
  [UserReadRepository.INJECTION_KEY]: { resolver: asClass(UserReadRepository) },
  [UserSettingsReadRepository.INJECTION_KEY]: {
    resolver: asClass(UserSettingsReadRepository)
  },
  [UserMapper.INJECTION_KEY]: { resolver: asClass(UserMapper) },
  [GetUserSettingsUseCase.INJECTION_KEY]: { resolver: asClass(GetUserSettingsUseCase) }
} as const satisfies DependenciesMap;

export const mutationDependencies = {
  [UserRepository.INJECTION_KEY]: { resolver: asClass(UserRepository) },
  [UserSettingsRepository.INJECTION_KEY]: { resolver: asClass(UserSettingsRepository) },
  [UserMapper.INJECTION_KEY]: { resolver: asClass(UserMapper) },
  [SaveUserSettingsUseCase.INJECTION_KEY]: { resolver: asClass(SaveUserSettingsUseCase) }
} as const satisfies DependenciesMap;
