import { useAuthedQuery } from '@/auth/composables/useAuth';
import { api, type GameId } from '@game/api';
import type { Nullable } from '@game/shared';

export const useGameInfos = (gameId: Ref<Nullable<GameId>>) => {
  return useAuthedQuery(
    api.games.infosById,
    computed(() => ({ gameId: gameId.value! })),
    { enabled: computed(() => !!gameId.value) }
  );
};
