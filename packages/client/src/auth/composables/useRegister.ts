import { api, type SessionId } from '@game/api';
import { useAuth, useAuthedMutation } from './useAuth';

export const useRegister = (onSuccess?: (sessionId: SessionId) => void) => {
  const { sessionId } = useAuth();

  return useAuthedMutation(api.auth.register, {
    onSuccess(data) {
      sessionId.value = data.sessionId;
      onSuccess?.(data.sessionId);
    }
  });
};
