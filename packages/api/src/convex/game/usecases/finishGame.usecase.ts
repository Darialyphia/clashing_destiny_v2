import type { UseCase } from '../../usecase';
import type { UserId } from '../../users/entities/user.entity';
import { AppError, DomainError } from '../../utils/error';
import type { GameId } from '../entities/game.entity';
import type { GameRepository } from '../repositories/game.repository';

export type FinishGameInput = {
  gameId: GameId;
  winnerId: UserId | null;
};

export type FinishGameOutput = {
  success: true;
};

export class FinishGameUseCase implements UseCase<FinishGameInput, FinishGameOutput> {
  static INJECTION_KEY = 'finishGameUseCase' as const;

  constructor(
    private ctx: {
      gameRepo: GameRepository;
    }
  ) {}

  async execute(input: FinishGameInput): Promise<FinishGameOutput> {
    const game = await this.ctx.gameRepo.getById(input.gameId);
    if (!game) {
      throw new AppError('Game not found');
    }

    if (!game.canFinish) {
      throw new DomainError('Game is not in ongoing status');
    }

    game.finish(input.winnerId);
    await this.ctx.gameRepo.save(game);

    return { success: true };
  }
}
