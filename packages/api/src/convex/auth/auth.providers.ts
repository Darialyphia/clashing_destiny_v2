import { asClass } from 'awilix';
import {
  SessionReadRepository,
  SessionRepository
} from './repositories/session.repository';
import { LoginUseCase } from './usecases/login.usecase';
import { LogoutUseCase } from './usecases/logout.usecase';
import { RegisterUseCase } from './usecases/register.usecase';
import { GetSessionUserUseCase } from './usecases/getSessionUser.usecase';
import type { DependenciesMap } from '../shared/container';

export const queryDependencies = {
  [SessionReadRepository.INJECTION_KEY]: { resolver: asClass(SessionReadRepository) },
  [GetSessionUserUseCase.INJECTION_KEY]: { resolver: asClass(GetSessionUserUseCase) }
} as const satisfies DependenciesMap;

export const mutationDependencies = {
  [SessionRepository.INJECTION_KEY]: { resolver: asClass(SessionRepository) },
  [LoginUseCase.INJECTION_KEY]: { resolver: asClass(LoginUseCase) },
  [LogoutUseCase.INJECTION_KEY]: { resolver: asClass(LogoutUseCase) },
  [RegisterUseCase.INJECTION_KEY]: { resolver: asClass(RegisterUseCase) }
} as const;
