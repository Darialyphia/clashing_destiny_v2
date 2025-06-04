import { useSafeInject } from '@/shared/composables/useSafeInject';
import {
  GameClient,
  type GameClientOptions,
  type NetworkAdapter
} from '@game/engine/src/client/client';
import type { InjectionKey, Ref } from 'vue';

type GameClientContext = Ref<GameClient>;

const GAME_CLIENT_INJECTION_KEY = Symbol(
  'game-client'
) as InjectionKey<GameClientContext>;

export const provideGameClient = (options: GameClientOptions) => {
  const client = ref(new GameClient(options)) as Ref<GameClient>;

  provide(GAME_CLIENT_INJECTION_KEY, client);
  return client;
};

export const useGameClient = () => {
  return useSafeInject(GAME_CLIENT_INJECTION_KEY);
};
