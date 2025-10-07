import { api, type SessionId } from '@game/api';
import { useAuth, useAuthedMutation } from './useAuth';

export const useLogin = (onSuccess?: (sessionId: SessionId) => void) => {
  const { sessionId } = useAuth();

  return useAuthedMutation(api.auth.login, {
    onSuccess(data) {
      sessionId.value = data.sessionId;
      onSuccess?.(data.sessionId);
    }
  });
};
