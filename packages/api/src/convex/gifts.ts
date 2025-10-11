import { v } from 'convex/values';
import { GIFT_CONTENTS_VALIDATOR, GIFT_SOURCE_VALIDATOR } from './gift/gift.schemas';
import { GiveGiftUseCase } from './gift/usecases/giveGift.usecase';
import { internalMutationWithContainer } from './shared/container';

export const giveGift = internalMutationWithContainer({
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
