import type { UseCase } from '../../usecase';
import { AppError, DomainError } from '../../utils/error';
import type { GameId } from '../entities/game.entity';
import type { GameRepository } from '../repositories/game.repository';

export type StartGameInput = {
  gameId: GameId;
};

export type StartGameOutput = {
  success: true;
};

export class StartGameUseCase implements UseCase<StartGameInput, StartGameOutput> {
  static INJECTION_KEY = 'startGameUseCase' as const;

  constructor(
    private ctx: {
      gameRepo: GameRepository;
    }
  ) {}

  async execute(input: StartGameInput): Promise<StartGameOutput> {
    const game = await this.ctx.gameRepo.getById(input.gameId);
    if (!game) {
      throw new AppError('Game not found');
    }

    if (!game.canStart) {
      throw new DomainError('Game is not in waiting for players status');
    }

    game.start();
    await this.ctx.gameRepo.save(game);

    return { success: true };
  }
}
