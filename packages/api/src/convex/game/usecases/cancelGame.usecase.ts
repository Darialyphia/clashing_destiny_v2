import { type UseCase } from '../../usecase';
import { AppError, DomainError } from '../../utils/error';
import type { GameId } from '../entities/game.entity';
import type { GameRepository } from '../repositories/game.repository';

export type CancelGameInput = {
  gameId: GameId;
};

export type CancelGameOutput = {
  success: true;
};

export class CancelGameUseCase implements UseCase<CancelGameInput, CancelGameOutput> {
  static INJECTION_KEY = 'cancelGameUseCase' as const;

  constructor(private ctx: { gameRepo: GameRepository }) {}

  async execute(input: CancelGameInput): Promise<CancelGameOutput> {
    const game = await this.ctx.gameRepo.getById(input.gameId);
    if (!game) {
      throw new AppError('Game not found');
    }

    if (!game.canCancel) {
      throw new DomainError('Game is not in playing status');
    }

    game.cancel();
    await this.ctx.gameRepo.save(game);

    return { success: true };
  }
}
