import type { DeckId } from '../../deck/entities/deck.entity';
import type { UseCase } from '../../usecase';
import type { UserId } from '../../users/entities/user.entity';
import type { GameRepository } from '../repositories/game.repository';

export type SetupRankedGameInput = {
  pair: [{ deckId: DeckId; userId: UserId }, { deckId: DeckId; userId: UserId }];
};

export type SetupRankedGameOutput = { success: boolean };

export class SetupRankedGameUsecase
  implements UseCase<SetupRankedGameInput, SetupRankedGameOutput>
{
  static INJECTION_KEY = 'setupRankedGameUsecase' as const;

  constructor(private ctx: { gameRepo: GameRepository }) {}

  async execute(input: SetupRankedGameInput) {
    const game = await this.ctx.gameRepo.create(input.pair, {
      disableTurnTimers: false,
      teachingMode: false
    });
    // await this.ctx.gameRepo.scheduleCancellation(game);
    await this.ctx.gameRepo.save(game);

    return { success: true };
  }
}
