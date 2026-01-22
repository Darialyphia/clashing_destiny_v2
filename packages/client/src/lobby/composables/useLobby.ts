import { useAuth, useAuthedMutation } from '@/auth/composables/useAuth';
import { api } from '@game/api';

export const useCreateLobby = (
  onSuccess?: (data: { lobbyId: string }) => void
) => {
  return useAuthedMutation(api.lobbies.create, {
    onSuccess
  });
};

export const useLeaveLobby = (onSuccess?: () => void) => {
  return useAuthedMutation(api.lobbies.leave, {
    onSuccess
  });
};

export const useJoinLobby = (onSuccess?: () => void) => {
  return useAuthedMutation(api.lobbies.join, {
    onSuccess
  });
};

export const useChangeLobbyRole = () => {
  return useAuthedMutation(api.lobbies.changeRole, {});
};

export const useUpdateLobbyOptions = () => {
  const session = useAuth();

  return useAuthedMutation(api.lobbies.updateOptions, {
    optimisticUpdate: (store, arg) => {
      const query = store.getQuery(api.lobbies.byId, {
        lobbyId: arg.lobbyId,
        // @ts-expect-error
        sessionId: session.sessionId.value
      });
      if (!query) return;

      store.setQuery(
        api.lobbies.byId,
        {
          lobbyId: arg.lobbyId,
          // @ts-expect-error
          sessionId: session.sessionId.value
        },
        {
          ...query,
          options: {
            ...query.options,
            ...arg.options
          }
        }
      );
    }
  });
};

export const useSelectLobbyDeck = () => {
  return useAuthedMutation(api.lobbies.selectDeck);
};

export const useStartLobby = () => {
  return useAuthedMutation(api.lobbies.start);
};
