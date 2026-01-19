import { v } from 'convex/values';
import { GetMyCollectionUseCase } from './card/usecases/getMyCollection.usecase';
import {
  internalMutationWithContainer,
  mutationWithContainer,
  queryWithContainer
} from './shared/container';
import { GrantMissingCardsUseCase } from './card/usecases/grantMissingCards.usecase';
import { GetUnopenedPacksUseCase } from './card/usecases/getUnopenedPacks.usecase';
import { PurchaseBoosterPacksUseCase } from './card/usecases/purchaseBoosterPacks.usecase';
import { OpenBoosterPackUseCase } from './card/usecases/openBoosterPack.usecase';

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

export const unopenedPacks = queryWithContainer({
  args: {},
  handler: async ctx => {
    const usecase = ctx.resolve<GetUnopenedPacksUseCase>(
      GetUnopenedPacksUseCase.INJECTION_KEY
    );

    return usecase.execute();
  }
});

export const purchasePacks = mutationWithContainer({
  args: {
    packType: v.string(),
    quantity: v.number()
  },
  handler: async (ctx, args) => {
    const usecase = ctx.resolve<PurchaseBoosterPacksUseCase>(
      PurchaseBoosterPacksUseCase.INJECTION_KEY
    );

    return usecase.execute({
      packType: args.packType,
      quantity: args.quantity
    });
  }
});

export const openPack = mutationWithContainer({
  args: {
    packId: v.id('boosterPacks')
  },
  handler: async (ctx, args) => {
    const usecase = ctx.resolve<OpenBoosterPackUseCase>(
      OpenBoosterPackUseCase.INJECTION_KEY
    );

    return usecase.execute({
      packId: args.packId
    });
  }
});
