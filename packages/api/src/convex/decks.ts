import type { SpellSchool } from '@game/engine/src/card/card.enums';
import { CreateDeckUseCase } from './deck/usecases/createDeck.usecase';
import { GetDecksUseCase } from './deck/usecases/getDecks.usecase';
import { GrantPremadeDeckUseCase } from './deck/usecases/grantPremadeDeck';
import { UpdateDeckUseCase } from './deck/usecases/updateDeck.usecase';
import {
  internalMutationWithContainer,
  mutationWithContainer,
  queryWithContainer
} from './shared/container';
import { v, type Validator } from 'convex/values';
import { DeleteDeckUseCase } from './deck/usecases/deleteDeck.usecase';

export const list = queryWithContainer({
  args: {},
  handler: async ctx => {
    const usecase = ctx.resolve<GetDecksUseCase>(GetDecksUseCase.INJECTION_KEY);

    return usecase.execute();
  }
});

export const grantPremadeDeck = internalMutationWithContainer({
  args: {
    userId: v.id('users'),
    premadeDeckId: v.string()
  },
  handler: async (ctx, arg) => {
    const usecase = ctx.resolve<GrantPremadeDeckUseCase>(
      GrantPremadeDeckUseCase.INJECTION_KEY
    );

    return usecase.execute({
      userId: arg.userId,
      premadeDeckId: arg.premadeDeckId
    });
  }
});

export const create = mutationWithContainer({
  args: {},
  handler: async ctx => {
    const usecase = ctx.resolve<CreateDeckUseCase>(CreateDeckUseCase.INJECTION_KEY);

    return usecase.execute();
  }
});

export const update = mutationWithContainer({
  args: {
    deckId: v.id('decks'),
    name: v.string(),
    spellSchools: v.array(v.string()) as Validator<SpellSchool[]>,
    mainDeck: v.array(
      v.object({
        cardId: v.id('cards'),
        copies: v.number()
      })
    ),
    destinyDeck: v.array(
      v.object({
        cardId: v.id('cards'),
        copies: v.number()
      })
    )
  },
  handler: async (ctx, arg) => {
    const usecase = ctx.resolve<UpdateDeckUseCase>(UpdateDeckUseCase.INJECTION_KEY);

    return usecase.execute({
      deckId: arg.deckId,
      name: arg.name,
      mainDeck: arg.mainDeck,
      destinyDeck: arg.destinyDeck,
      spellSchools: arg.spellSchools
    });
  }
});

export const destroy = mutationWithContainer({
  args: {
    deckId: v.id('decks')
  },
  handler: async (ctx, arg) => {
    const usecase = ctx.resolve<DeleteDeckUseCase>(DeleteDeckUseCase.INJECTION_KEY);

    return usecase.execute({
      deckId: arg.deckId
    });
  }
});
