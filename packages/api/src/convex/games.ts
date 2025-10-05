import { v } from 'convex/values';
import { internalMutationWithContainer } from './shared/container';
import { CancelGameUseCase } from './game/usecases/cancelGame.usecase';
import type { DeckId } from './deck/entities/deck.entity';
import { SetupRankedGameUsecase } from './game/usecases/setupRankedGame.usecase';
import type { UserId } from './users/entities/user.entity';

export const cancel = internalMutationWithContainer({
  args: { gameId: v.id('games') },
  handler: async (ctx, input) => {
    const usecase = ctx.resolve<CancelGameUseCase>(CancelGameUseCase.INJECTION_KEY);

    return usecase.execute({
      gameId: input.gameId
    });
  }
});

export const setupRankedGame = internalMutationWithContainer({
  args: {
    pair: v.array(
      v.object({
        deckId: v.id('decks'),
        userId: v.id('users')
      })
    )
  },
  handler: async (ctx, input) => {
    const usecase = ctx.resolve<SetupRankedGameUsecase>(
      SetupRankedGameUsecase.INJECTION_KEY
    );

    return usecase.execute({
      pair: input.pair as [
        { deckId: DeckId; userId: UserId },
        { deckId: DeckId; userId: UserId }
      ]
    });
  }
});
