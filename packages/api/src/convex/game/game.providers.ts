import { asClass } from 'awilix';
import { GameReadRepository, GameRepository } from './repositories/game.repository';
import {
  GamePlayerReadRepository,
  GamePlayerRepository
} from './repositories/gamePlayer.repository';
import { GameMapper } from './mappers/game.mapper';
import { GamePlayerMapper } from './mappers/gamePlayer.mapper';
import { CancelGameUseCase } from './usecases/cancelGame.usecase';
import { GameSubscribers } from './game.subscribers';
import { SetupRankedGameUsecase } from './usecases/setupRankedGame.usecase';
import { StartGameUseCase } from './usecases/startGame.usecase';
import { GetLatestGamesUseCase } from './usecases/getLatestGames.usecase';
import { GetGameInfosUseCase } from './usecases/getGameInfos.usecase';
import { FinishGameUseCase } from './usecases/finishGame.usecase';
import type { DependenciesMap } from '../shared/container';

export const queryDependencies: DependenciesMap = {
  [GameReadRepository.INJECTION_KEY]: { resolver: asClass(GameReadRepository) },
  [GamePlayerReadRepository.INJECTION_KEY]: {
    resolver: asClass(GamePlayerReadRepository)
  },
  [GameMapper.INJECTION_KEY]: { resolver: asClass(GameMapper) },
  [GamePlayerMapper.INJECTION_KEY]: { resolver: asClass(GamePlayerMapper) },
  [GetLatestGamesUseCase.INJECTION_KEY]: { resolver: asClass(GetLatestGamesUseCase) },
  [GetGameInfosUseCase.INJECTION_KEY]: { resolver: asClass(GetGameInfosUseCase) }
};

export const mutationDependencies: DependenciesMap = {
  [GameRepository.INJECTION_KEY]: { resolver: asClass(GameRepository) },
  [GamePlayerRepository.INJECTION_KEY]: { resolver: asClass(GamePlayerRepository) },
  [GameMapper.INJECTION_KEY]: { resolver: asClass(GameMapper) },
  [GamePlayerMapper.INJECTION_KEY]: { resolver: asClass(GamePlayerMapper) },
  [GameSubscribers.INJECTION_KEY]: { resolver: asClass(GameSubscribers), eager: true },
  [CancelGameUseCase.INJECTION_KEY]: { resolver: asClass(CancelGameUseCase) },
  [StartGameUseCase.INJECTION_KEY]: { resolver: asClass(StartGameUseCase) },
  [FinishGameUseCase.INJECTION_KEY]: { resolver: asClass(FinishGameUseCase) },
  [SetupRankedGameUsecase.INJECTION_KEY]: { resolver: asClass(SetupRankedGameUsecase) }
};
