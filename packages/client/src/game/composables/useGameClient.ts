import { useSafeInject } from '@/shared/composables/useSafeInject';
import {
  GameClient,
  type GameClientOptions,
  type NetworkAdapter
} from '@game/engine/src/client/client';
import type {
  FXEvent,
  FXEventMap
} from '@game/engine/src/client/controllers/fx-controller';
import type { CardViewModel } from '@game/engine/src/client/view-models/card.model';
import type { PlayerViewModel } from '@game/engine/src/client/view-models/player.model';
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

export const useCard = (cardId: MaybeRef<string>) => {
  const state = useGameState();
  return computed(() => {
    const card = state.value.entities[unref(cardId)];
    if (!card) {
      throw new Error(
        `Card with ID ${unref(cardId)} not found in the game state.`
      );
    }
    return card as unknown as CardViewModel;
  });
};

export const useFxEvent = <T extends FXEvent>(
  name: T,
  handler: (eventArg: FXEventMap[T]) => Promise<void>
) => {
  const client = useGameClient();

  const unsub = client.value.fx.on(name, handler);

  onUnmounted(unsub);

  return unsub;
};

export const useMyPlayer = () => {
  const state = useGameState();
  const board = useMyBoard();
  return computed(() => {
    return state.value.entities[board.value.playerId] as PlayerViewModel;
  });
};

export const useOpponentPlayer = () => {
  const state = useGameState();
  const board = useOpponentBoard();
  return computed(() => {
    return state.value.entities[board.value.playerId] as PlayerViewModel;
  });
};
