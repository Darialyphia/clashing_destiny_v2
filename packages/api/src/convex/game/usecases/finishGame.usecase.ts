import type { EventEmitter } from '../../shared/eventEmitter';
import type { UseCase } from '../../usecase';
import type { UserId } from '../../users/entities/user.entity';
import { AppError, DomainError } from '../../utils/error';
import { Game, type GameId } from '../entities/game.entity';
import { GameEndedEvent } from '../events/gameEnded.event';
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
      eventEmitter: EventEmitter;
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
    await this.ctx.eventEmitter.emit(
      GameEndedEvent.EVENT_NAME,
      new GameEndedEvent(game.id)
    );
    return { success: true };
  }
}
