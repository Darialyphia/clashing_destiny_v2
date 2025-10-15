import { v } from 'convex/values';
import { GetMyCollectionUseCase } from './card/usecases/getMyCollection.usecase';
import { internalMutationWithContainer, queryWithContainer } from './shared/container';
import { GrantMissingCardsUseCase } from './card/usecases/grantMissingCards.usecase';

export const myCollection = queryWithContainer({
  args: {},
  handler: async ctx => {
    const usecase = ctx.resolve<GetMyCollectionUseCase>(
      GetMyCollectionUseCase.INJECTION_KEY
    );

    return usecase.execute();
  }
});

export const grantMissing = internalMutationWithContainer({
  args: {
    userId: v.id('users')
  },
  handler: async (ctx, input) => {
    const usecase = ctx.resolve<GrantMissingCardsUseCase>(
      GrantMissingCardsUseCase.INJECTION_KEY
    );

    return usecase.execute({ userId: input.userId });
  }
});
