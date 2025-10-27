import { useAuthedMutation, useAuthedQuery } from '@/auth/composables/useAuth';
import { api } from '@game/api';
import type { AnyFunction } from '@game/shared';

export const useDecks = () => {
  return useAuthedQuery(api.decks.list, {});
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
