import { api } from '@game/api';
import { useAuth, useAuthedMutation } from './useAuth';

export const useLogout = (onSuccess?: () => void) => {
  const { sessionId } = useAuth();

  return useAuthedMutation(api.auth.logout, {
    onSuccess() {
      sessionId.value = null;
      onSuccess?.();
    }
  });
};
