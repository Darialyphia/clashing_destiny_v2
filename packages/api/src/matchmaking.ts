import { v } from 'convex/values';

import { ensureAuthenticated, mutationWithSession } from './auth/auth.utils';
import { UserRepository } from './users/repositories/user.repository';
import { JoinMatchmakingUseCase } from './matchmaking/usecases/joinMatchmaking.usecase';
import { MatchmakingUserRepository } from './matchmaking/repositories/matchmakingUser.repository';
import { MatchmakingRepository } from './matchmaking/repositories/matchmaking.repository';
import { LeaveMatchmakingUseCase } from './matchmaking/usecases/leaveMatchmaking.usecase';

export const join = mutationWithSession({
  args: { name: v.string() },
  handler: async (ctx, input) => {
    const session = ensureAuthenticated(ctx.session);
    const userRepo = new UserRepository(ctx.db);
    const matchmakingUserRepo = new MatchmakingUserRepository(ctx.db, userRepo);
    const usecase = new JoinMatchmakingUseCase({
      userRepo,
      session,
      matchmakingUserRepo,
      matchmakingRepo: new MatchmakingRepository({ db: ctx.db, matchmakingUserRepo })
    });

    return usecase.execute({
      name: input.name
    });
  }
});

export const leave = mutationWithSession({
  args: {},
  handler: async ctx => {
    const session = ensureAuthenticated(ctx.session);
    const userRepo = new UserRepository(ctx.db);
    const matchmakingUserRepo = new MatchmakingUserRepository(ctx.db, userRepo);
    const usecase = new LeaveMatchmakingUseCase({
      userRepo,
      session,
      matchmakingUserRepo,
      matchmakingRepo: new MatchmakingRepository({ db: ctx.db, matchmakingUserRepo })
    });

    return usecase.execute();
  }
});
