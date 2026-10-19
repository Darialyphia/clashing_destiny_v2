import { api, GAME_STATUS } from '@game/api';
import { useAuthedQuery } from './useAuth';

export const useMe = () => {
  return useAuthedQuery(api.auth.me, {});
};

export const useCurrentGameRedirect = () => {
  const { data: me } = useMe();

  const router = useRouter();
  watch(
    me,
    newVal => {
      if (!newVal) return;
      if (
        newVal.currentGame &&
        newVal.currentGame.status !== GAME_STATUS.CANCELLED &&
        newVal.currentGame.status !== GAME_STATUS.FINISHED
      ) {
        router.replace({ name: 'CurrentGame' });
      }
    },
    { immediate: true }
  );
};
