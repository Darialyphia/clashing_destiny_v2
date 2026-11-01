import { v } from 'convex/values';
import {
  internalMutationWithContainer,
  mutationWithContainer,
  queryWithContainer
} from './shared/container';
import { CancelGameUseCase } from './game/usecases/cancelGame.usecase';
import type { DeckId } from './deck/entities/deck.entity';
import { SetupRankedGameUsecase } from './game/usecases/setupRankedGame.usecase';
import type { UserId } from './users/entities/user.entity';
import { StartGameUseCase } from './game/usecases/startGame.usecase';
import { GetLiveGamesUseCase } from './game/usecases/getLiveGames.usecase';
import { GetGameInfosUseCase } from './game/usecases/getGameInfos.usecase';
import { ensureValidApiKey } from './auth/auth.utils';
import { FinishGameUseCase } from './game/usecases/finishGame.usecase';
import { MarkGameReadyUseCase } from './game/usecases/markGameReady.usecase';

export const internalCancel = internalMutationWithContainer({
  args: { gameId: v.id('games') },
  handler: async (ctx, input) => {
    const usecase = ctx.resolve<CancelGameUseCase>(CancelGameUseCase.INJECTION_KEY);

    return usecase.execute({
      gameId: input.gameId
    });
  }
});

export const cancel = mutationWithContainer({
  args: { gameId: v.id('games'), apiKey: v.string() },
  handler: async (ctx, input) => {
    ensureValidApiKey(input.apiKey);
    const usecase = ctx.resolve<CancelGameUseCase>(CancelGameUseCase.INJECTION_KEY);

    return usecase.execute({
      gameId: input.gameId
    });
  }
});

export const markReady = mutationWithContainer({
  args: { gameId: v.id('games'), apiKey: v.string() },
  handler: async (ctx, input) => {
    ensureValidApiKey(input.apiKey);
    const usecase = ctx.resolve<MarkGameReadyUseCase>(MarkGameReadyUseCase.INJECTION_KEY);

    return usecase.execute({
      gameId: input.gameId
    });
  }
});

export const start = mutationWithContainer({
  args: { gameId: v.id('games'), apiKey: v.string() },
  handler: async (ctx, input) => {
    ensureValidApiKey(input.apiKey);
    const usecase = ctx.resolve<StartGameUseCase>(StartGameUseCase.INJECTION_KEY);

    return usecase.execute({
      gameId: input.gameId
    });
  }
});

export const finish = mutationWithContainer({
  args: {
    gameId: v.id('games'),
    winnerId: v.union(v.id('users'), v.null()),
    apiKey: v.string()
  },
  handler: async (ctx, input) => {
    ensureValidApiKey(input.apiKey);
    const usecase = ctx.resolve<FinishGameUseCase>(FinishGameUseCase.INJECTION_KEY);

    return usecase.execute({
      gameId: input.gameId,
      winnerId: input.winnerId
    });
  }
});

export const infosById = queryWithContainer({
  args: { gameId: v.id('games') },
  handler: async (ctx, input) => {
    const usecase = ctx.resolve<GetGameInfosUseCase>(GetGameInfosUseCase.INJECTION_KEY);

    return usecase.execute({
      gameId: input.gameId
    });
  }
});

export const live = queryWithContainer({
  args: {},
  handler: async ctx => {
    const usecase = ctx.resolve<GetLiveGamesUseCase>(GetLiveGamesUseCase.INJECTION_KEY);

    return usecase.execute();
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
