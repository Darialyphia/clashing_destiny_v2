import { useAuthedMutation, useAuthedQuery } from '@/auth/composables/useAuth';
import { api } from '@game/api';
import { CARD_SET_DICTIONARY } from '@game/engine/src/card/sets';
import { StandardDeckValidator } from '@game/engine/src/card/validators/deck.validator';
import { isDefined, type AnyFunction } from '@game/shared';
import { keyBy } from 'lodash-es';

export const useDecks = () => {
  const query = useAuthedQuery(api.decks.list, {});

  const cardPool = Object.values(CARD_SET_DICTIONARY).flatMap(set => set.cards);
  const validator = new StandardDeckValidator(keyBy(cardPool, 'id'));

  return {
    ...query,
    data: computed(() => {
      if (!isDefined(query.data.value)) return query.data.value;

      return query.data.value.map(deck => ({
        ...deck,
        isValid: validator.validate({
          name: deck.name,
          id: deck.id,
          cards: deck.cards.map(c => ({
            blueprintId: c.blueprintId,
            copies: c.copies,
            meta: {
              cardId: c.cardId
            }
          })),
          isEqual(a, b) {
            // @ts-expect-error - We know these are the only possible types at this point
            return a.meta.cardId === b.meta.cardId;
          }
        })
      }));
    })
  };
};

type UseDecksMutation = ReturnType<typeof useDecks>;
export type UserDeck = UseDecksMutation['data']['value'][number];

export const useCreateDeck = (
  onSuccess?: (data: { deckId: string }) => void
) => {
  return useAuthedMutation(api.decks.create, {
    onSuccess
  });
};

export const useUpdateDeck = (onSuccess?: AnyFunction) => {
  return useAuthedMutation(api.decks.update, { onSuccess });
};

export const useDeleteDeck = (onSuccess?: AnyFunction) => {
  return useAuthedMutation(api.decks.destroy, { onSuccess });
};
