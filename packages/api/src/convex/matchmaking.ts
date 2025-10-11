import { v } from 'convex/values';
import { ensureAuthenticated } from './auth/auth.utils';
import { JoinMatchmakingUseCase } from './matchmaking/usecases/joinMatchmaking.usecase';
import { LeaveMatchmakingUseCase } from './matchmaking/usecases/leaveMatchmaking.usecase';
import { RunMatchmakingUseCase } from './matchmaking/usecases/runMatchmaking.usecase';
import {
  internalMutationWithContainer,
  mutationWithContainer,
  queryWithContainer
} from './shared/container';
import { GetMatchmakingsUsecase } from './matchmaking/usecases/getMatchmakings.usecase';
import { KickFromMatchmakingUseCase } from './matchmaking/usecases/kickFromMatchmaking.usecase';

export const list = queryWithContainer({
  args: {},
  handler: async ctx => {
    ensureAuthenticated(ctx.resolve('session'));
    const usecase = ctx.resolve<GetMatchmakingsUsecase>(
      GetMatchmakingsUsecase.INJECTION_KEY
    );

    return usecase.execute();
  }
});

export const join = mutationWithContainer({
  args: { name: v.string(), deckId: v.id('decks') },
  handler: async (ctx, input) => {
    const usecase = ctx.resolve<JoinMatchmakingUseCase>(
      JoinMatchmakingUseCase.INJECTION_KEY
    );
    return usecase.execute({
      name: input.name,
      deckId: input.deckId
    });
  }
});

export const leave = mutationWithContainer({
  args: {},
  handler: async ctx => {
    ensureAuthenticated(ctx.resolve('session'));

    const usecase = ctx.resolve<LeaveMatchmakingUseCase>(
      LeaveMatchmakingUseCase.INJECTION_KEY
    );

    return usecase.execute();
  }
});

export const run = internalMutationWithContainer({
  args: { name: v.string() },
  handler: async (ctx, input) => {
    const usecase = ctx.resolve<RunMatchmakingUseCase>(
      RunMatchmakingUseCase.INJECTION_KEY
    );

    return usecase.execute({
      name: input.name
    });
  }
});

export const kick = internalMutationWithContainer({
  args: { userId: v.id('users') },
  handler: async (ctx, input) => {
    const usecase = ctx.resolve<KickFromMatchmakingUseCase>(
      KickFromMatchmakingUseCase.INJECTION_KEY
    );

    return usecase.execute({ userId: input.userId });
  }
});
