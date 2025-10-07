import { useAuthedMutation } from '@/auth/composables/useAuth';
import { api } from '@game/api';

export const useJoinMatchmaking = () => {
  return useAuthedMutation(api.matchmaking.join);
};

export const useLeaveMatchmaking = () => {
  return useAuthedMutation(api.matchmaking.leave);
};
