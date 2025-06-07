import { useSafeInject } from '@/shared/composables/useSafeInject';
import {
  GameClient,
  type GameClientOptions,
  type NetworkAdapter
} from '@game/engine/src/client/client';
import type { CardViewModel } from '@game/engine/src/client/view-models/card.model';
import type { InjectionKey, Ref } from 'vue';

type GameClientContext = Ref<GameClient>;

const GAME_CLIENT_INJECTION_KEY = Symbol(
  'game-client'
) as InjectionKey<GameClientContext>;

export const provideGameClient = (options: GameClientOptions) => {
  const client = ref(new GameClient(options)) as Ref<GameClient>;
  client.value.onUpdate(() => {
    triggerRef(client);
  });

  provide(GAME_CLIENT_INJECTION_KEY, client);
  return client;
};

export const useGameClient = () => {
  return useSafeInject(GAME_CLIENT_INJECTION_KEY);
};

export const useGameState = () => {
  const client = useGameClient();

  return computed(() => client.value.stateManager.state);
};

export const useGameUi = () => {
  const client = useGameClient();

  return computed(() => client.value.ui);
};

export const useBoardSide = (playerId: MaybeRef<string>) => {
  const client = useGameClient();
  return computed(() => {
    return client.value.state.board.sides.find(
      side => side.playerId === unref(playerId)
    )!;
  });
};

export const useMyBoard = () => {
  const client = useGameClient();

  return computed(
    () =>
      client.value.state.board.sides.find(
        side => side.playerId === client.value.playerId
      )!
  );
};

export const useOpponentBoard = () => {
  const client = useGameClient();

  return computed(
    () =>
      client.value.state.board.sides.find(
        side => side.playerId !== client.value.playerId
      )!
  );
};

export const useCard = (cardId: string) => {
  const client = useGameClient();
  return computed(() => {
    const card = client.value.state.entities[cardId];
    if (!card) {
      throw new Error(`Card with ID ${cardId} not found in the game state.`);
    }
    return card as unknown as CardViewModel;
  });
};
