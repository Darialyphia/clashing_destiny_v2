import { v } from 'convex/values';
import { GIFT_CONTENTS_VALIDATOR, GIFT_SOURCE_VALIDATOR } from './gift/gift.schemas';
import { GiveGiftUseCase } from './gift/usecases/giveGift.usecase';
import {
  internalMutationWithContainer,
  mutationWithContainer,
  queryWithContainer
} from './shared/container';
import { ClaimGiftUseCase } from './gift/usecases/claimGift.usecase';
import { GetMyGiftsUseCase } from './gift/usecases/getMyGifts.usecase';

export const give = internalMutationWithContainer({
  args: {
    receiverId: v.id('users'),
    name: v.string(),
    source: GIFT_SOURCE_VALIDATOR,
    contents: GIFT_CONTENTS_VALIDATOR
  },
  handler: async (ctx, input) => {
    const usecase = ctx.resolve<GiveGiftUseCase>(GiveGiftUseCase.INJECTION_KEY);

    return usecase.execute({
      receiverId: input.receiverId,
      name: input.name,
      source: input.source,
      contents: input.contents
    });
  }
});

export const claim = mutationWithContainer({
  args: {
    giftId: v.id('gifts')
  },
  handler: async (ctx, input) => {
    const usecase = ctx.resolve<ClaimGiftUseCase>(ClaimGiftUseCase.INJECTION_KEY);

    return usecase.execute({
      giftId: input.giftId
    });
  }
});

export const list = queryWithContainer({
  args: {},
  handler: async ctx => {
    const usecase = ctx.resolve<GetMyGiftsUseCase>(GetMyGiftsUseCase.INJECTION_KEY);

    return usecase.execute();
  }
});
