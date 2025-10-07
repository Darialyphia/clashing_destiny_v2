import { api } from '@game/api';
import { useAuthedQuery } from './useAuth';

export const useMe = () => {
  return useAuthedQuery(api.auth.me, {});
};
