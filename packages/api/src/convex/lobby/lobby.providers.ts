import { asClass } from 'awilix';
import { LobbyReadRepository, LobbyRepository } from './repositories/lobby.repository';
import {
  LobbyUserReadRepository,
  LobbyUserRepository
} from './repositories/lobbyUser.repository';
import { LobbyMapper } from './mappers/lobby.mapper';
import { LobbyUserMapper } from './mappers/lobbyUser.mapper';
import { CreateLobbyUseCase } from './usecases/createLobby.usecase';
import { JoinLobbyUseCase } from './usecases/joinLobby.usecase';
import { LeaveLobbyUseCase } from './usecases/leaveLobby.usecase';
import { SelectDeckForLobbyUseCase } from './usecases/selectDeckForLobby.usecase';
import { ChangeLobbyUserRoleUseCase } from './usecases/changeLobbyUserRole.usecase';
import { StartLobbyUseCase } from './usecases/startLobby.usecase';
import { GetLobbyByIdUseCase } from './usecases/getLobbyById.usecase';
import { GetAllLobbiesUseCase } from './usecases/getAllLobbies.usecase';
import { SetupLobbyGameUseCase } from './usecases/setupLobbyGame';
import { LobbySubscribers } from './lobby.subscribers';
import { DeleteLobbyUseCase } from './usecases/deleteLobby.usecase';
import { UpdateLobbyOptionsUseCase } from './usecases/updateLobbyOptions.usecase';
import { KickFromLobbyUseCase } from './usecases/kickFromLobby.usecase';
import type { DependenciesMap } from '../shared/container';

export const queryDependencies = {
  [LobbyReadRepository.INJECTION_KEY]: {
    resolver: asClass(LobbyReadRepository)
  },
  [LobbyUserReadRepository.INJECTION_KEY]: {
    resolver: asClass(LobbyUserReadRepository)
  },
  [LobbyMapper.INJECTION_KEY]: { resolver: asClass(LobbyMapper) },
  [LobbyUserMapper.INJECTION_KEY]: { resolver: asClass(LobbyUserMapper) },
  [GetLobbyByIdUseCase.INJECTION_KEY]: { resolver: asClass(GetLobbyByIdUseCase) },
  [GetAllLobbiesUseCase.INJECTION_KEY]: { resolver: asClass(GetAllLobbiesUseCase) }
} as const satisfies DependenciesMap;

export const mutationDependencies = {
  [LobbyRepository.INJECTION_KEY]: { resolver: asClass(LobbyRepository) },
  [LobbyUserRepository.INJECTION_KEY]: { resolver: asClass(LobbyUserRepository) },
  [LobbyMapper.INJECTION_KEY]: { resolver: asClass(LobbyMapper) },
  [LobbyUserMapper.INJECTION_KEY]: { resolver: asClass(LobbyUserMapper) },
  [LobbySubscribers.INJECTION_KEY]: {
    resolver: asClass(LobbySubscribers),
    eager: true
  },
  [CreateLobbyUseCase.INJECTION_KEY]: { resolver: asClass(CreateLobbyUseCase) },
  [JoinLobbyUseCase.INJECTION_KEY]: { resolver: asClass(JoinLobbyUseCase) },
  [LeaveLobbyUseCase.INJECTION_KEY]: { resolver: asClass(LeaveLobbyUseCase) },
  [SelectDeckForLobbyUseCase.INJECTION_KEY]: {
    resolver: asClass(SelectDeckForLobbyUseCase)
  },
  [ChangeLobbyUserRoleUseCase.INJECTION_KEY]: {
    resolver: asClass(ChangeLobbyUserRoleUseCase)
  },
  [StartLobbyUseCase.INJECTION_KEY]: { resolver: asClass(StartLobbyUseCase) },
  [UpdateLobbyOptionsUseCase.INJECTION_KEY]: {
    resolver: asClass(UpdateLobbyOptionsUseCase)
  },
  [SetupLobbyGameUseCase.INJECTION_KEY]: { resolver: asClass(SetupLobbyGameUseCase) },
  [DeleteLobbyUseCase.INJECTION_KEY]: { resolver: asClass(DeleteLobbyUseCase) },
  [KickFromLobbyUseCase.INJECTION_KEY]: { resolver: asClass(KickFromLobbyUseCase) }
} as const satisfies DependenciesMap;
