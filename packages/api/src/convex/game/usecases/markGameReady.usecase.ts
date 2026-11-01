import type { UseCase } from '../../usecase';
import { AppError, DomainError } from '../../utils/error';
import type { GameId } from '../entities/game.entity';
import { GAME_STATUS, WAITING_FOR_PLAYERS_GAME_TIMEOUT_MS } from '../game.constants';
import type { GameRepository } from '../repositories/game.repository';

export type MarkGameReadyInput = {
  gameId: GameId;
};

export type MarkGameReadyOutput = {
  success: true;
};

export class MarkGameReadyUseCase
  implements UseCase<MarkGameReadyInput, MarkGameReadyOutput>
{
  static INJECTION_KEY = 'markGameReadyUseCase' as const;

  constructor(
    private ctx: {
      gameRepo: GameRepository;
    }
  ) {}

  async execute(input: MarkGameReadyInput): Promise<MarkGameReadyOutput> {
    const game = await this.ctx.gameRepo.getById(input.gameId);
    if (!game) {
      throw new AppError('Game not found');
    }

    // the game server can retry after a failure, the first call may have gone through
    if (game.status === GAME_STATUS.WAITING_FOR_PLAYERS) {
      return { success: true };
    }

    if (!game.canMarkReady) {
      throw new DomainError('Game is not in initializing status');
    }

    game.markReady();
    if (game.cancellationId) {
      await this.ctx.gameRepo.abortCancellation(game);
    }
    await this.ctx.gameRepo.scheduleCancellation(
      game,
      WAITING_FOR_PLAYERS_GAME_TIMEOUT_MS
    );

    await this.ctx.gameRepo.save(game);

    return { success: true };
  }
}
