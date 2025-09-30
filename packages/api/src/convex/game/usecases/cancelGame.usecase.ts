import { MutationUseCase } from '../../usecase';
import { AppError, DomainError } from '../../utils/error';
import type { GameId } from '../entities/game.entity';
import { GAME_STATUS } from '../game.constants';

export type CancelGameInput = {
  gameId: GameId;
};

export type CancelGameOutput = {
  success: true;
};

export class CancelGameUseCase extends MutationUseCase<
  CancelGameInput,
  CancelGameOutput
> {
  static INJECTION_KEY = 'cancelGameUseCase' as const;

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
