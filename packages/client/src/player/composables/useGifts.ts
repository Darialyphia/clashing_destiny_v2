import { useAuthedMutation, useAuthedQuery } from '@/auth/composables/useAuth';
import { api } from '@game/api';

export const useClaimGift = () => {
  return useAuthedMutation(api.gifts.claim);
};

export const useGifts = () => {
  return useAuthedQuery(api.gifts.list, {});
};
