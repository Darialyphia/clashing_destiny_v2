import { v } from 'convex/values';
import { internalMutationWithContainer } from './shared/container';
import { CancelGameUseCase } from './game/usecases/cancelGame.usecase';

export const cancel = internalMutationWithContainer({
  args: { gameId: v.id('games') },
  handler: async (ctx, input) => {
    const usecase = ctx.resolve<CancelGameUseCase>(CancelGameUseCase.INJECTION_KEY);

    return usecase.execute({
      gameId: input.gameId
    });
  }
});
