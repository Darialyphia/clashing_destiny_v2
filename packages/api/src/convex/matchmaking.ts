import { v } from 'convex/values';

import {
  ensureAuthenticated,
  internalMutationWithSession,
  mutationWithSession
} from './auth/auth.utils';
import { UserRepository } from './users/repositories/user.repository';
import { JoinMatchmakingUseCase } from './matchmaking/usecases/joinMatchmaking.usecase';
import { MatchmakingUserRepository } from './matchmaking/repositories/matchmakingUser.repository';
import { MatchmakingRepository } from './matchmaking/repositories/matchmaking.repository';
import { LeaveMatchmakingUseCase } from './matchmaking/usecases/leaveMatchmaking.usecase';
import { ensureHasNoCurrentGame } from './game/game.guards';
import { GameRepository } from './game/repositories/game.repository';
import { GamePlayerRepository } from './game/repositories/gamePlayer.repository';
import { internalMutation } from './_generated/server';
import { RunMatchmakingUseCase } from './matchmaking/usecases/runMatchmaking.usecase';

export const join = mutationWithSession({
  args: { name: v.string(), deckId: v.id('decks') },
  handler: async (ctx, input) => {
    const session = ensureAuthenticated(ctx.session);

    const userRepo = new UserRepository(ctx.db);
    const matchmakingUserRepo = new MatchmakingUserRepository({ db: ctx.db, userRepo });
    const matchmakingRepo = new MatchmakingRepository({
      db: ctx.db,
      matchmakingUserRepo,
      scheduler: ctx.scheduler
    });
    const gamePlayerRepo = new GamePlayerRepository({ db: ctx.db, userRepo });
    const gameRepo = new GameRepository({
      db: ctx.db,
      userRepo,
      gamePlayerRepo
    });

    await ensureHasNoCurrentGame(gameRepo, session.userId);
    const usecase = new JoinMatchmakingUseCase({
      session,
      userRepo,
      matchmakingUserRepo,
      matchmakingRepo
    });

    return usecase.execute({
      name: input.name,
      deckId: input.deckId
    });
  }
});

export const leave = mutationWithSession({
  args: {},
  handler: async ctx => {
    const session = ensureAuthenticated(ctx.session);
    const userRepo = new UserRepository(ctx.db);
    const matchmakingUserRepo = new MatchmakingUserRepository({ db: ctx.db, userRepo });
    const usecase = new LeaveMatchmakingUseCase({
      session,
      userRepo,
      matchmakingUserRepo,
      matchmakingRepo: new MatchmakingRepository({
        db: ctx.db,
        matchmakingUserRepo,
        scheduler: ctx.scheduler
      })
    });

    return usecase.execute();
  }
});

export const run = internalMutation({
  args: { name: v.string() },
  handler: async (ctx, input) => {
    const userRepo = new UserRepository(ctx.db);
    const matchmakingUserRepo = new MatchmakingUserRepository({ db: ctx.db, userRepo });
    const matchmakingRepo = new MatchmakingRepository({
      db: ctx.db,
      matchmakingUserRepo,
      scheduler: ctx.scheduler
    });

    const usecase = new RunMatchmakingUseCase({
      matchmakingRepo,
      scheduler: ctx.scheduler
    });

    return usecase.execute({
      name: input.name
    });
  }
});
