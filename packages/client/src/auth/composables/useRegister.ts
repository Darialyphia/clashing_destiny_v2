import { useConvexMutation } from '@convex-vue/core';
import { api, type SessionId } from '@game/api';
import { useAuth } from './useAuth';

export const useRegister = (onSuccess?: (sessionId: SessionId) => void) => {
  const { sessionId } = useAuth();

  return useConvexMutation(api.auth.register, {
    onSuccess(data) {
      sessionId.value = data.sessionId;
      onSuccess?.(data.sessionId);
    }
  });
};
