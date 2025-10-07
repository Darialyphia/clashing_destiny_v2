import { useAuthedQuery } from '@/auth/composables/useAuth';
import { api } from '@game/api';

export const useMatchmakingList = () => {
  return useAuthedQuery(api.matchmaking.list, {});
};
