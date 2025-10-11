import { useSafeInject } from '@/shared/composables/useSafeInject';
import {
  GameClient,
  type GameClientOptions
} from '@game/engine/src/client/client';
import type {
  FXEvent,
  FXEventMap
} from '@game/engine/src/client/controllers/fx-controller';
import type { CardViewModel } from '@game/engine/src/client/view-models/card.model';
import type { PlayerViewModel } from '@game/engine/src/client/view-models/player.model';
import { isDefined, type MaybePromise, type Nullable } from '@game/shared';
import type { InjectionKey, Ref } from 'vue';
import { gameStateRef } from './gameStateRef';

type GameClientContext = { client: Ref<GameClient>; playerId: Ref<string> };

const GAME_CLIENT_INJECTION_KEY = Symbol(
  'game-client'
) as InjectionKey<GameClientContext>;

export const provideGameClient = (options: GameClientOptions) => {
  const client = ref(new GameClient(options)) as Ref<GameClient>;
  client.value.onUpdate(async () => {
    triggerRef(client);
    // console.log('[Client] state updated', client.value);
  });

  const playerId = ref(client.value.playerId);
  watch(playerId, newPlayerId => {
    client.value.playerId = newPlayerId;
  });

  provide(GAME_CLIENT_INJECTION_KEY, { client, playerId });

  return { client, playerId };
};

export const useGameClient = () => {
  return useSafeInject(GAME_CLIENT_INJECTION_KEY);
};

export const useGameState = () => {
  const { client } = useGameClient();

  return computed(() => client.value.stateManager.state);
};

export const useGameUi = () => {
  const { client } = useGameClient();

  return gameStateRef(() => client.value.ui);
};

export const useBoardSide = (playerId: MaybeRef<string>) => {
  const { client } = useGameClient();
  return computed(() => {
    return client.value.state.board.sides.find(
      side => side.playerId === unref(playerId)
    )!;
  });
};

export const useMyBoard = () => {
  const { client, playerId } = useGameClient();
  return computed(() => {
    return client.value.state.board.sides.find(
      side => side.playerId === playerId.value
    )!;
  });
};

export const useOpponentBoard = () => {
  const { client, playerId } = useGameClient();

  return computed(
    () =>
      client.value.state.board.sides.find(
        side => side.playerId !== playerId.value
      )!
  );
};

export const useEntity = <T>(entityId: MaybeRef<string>) => {
  return gameStateRef(state => {
    return state.entities[unref(entityId)] as T;
  });
};

export const useMaybeEntity = <T>(entityId: MaybeRef<Nullable<string>>) => {
  return gameStateRef(state => {
    const id = unref(entityId);
    if (!isDefined(id)) return null;

    return state.entities[id] as T;
  });
};

export const useEntities = <T>(entityIds: MaybeRef<string[]>) => {
  const state = useGameState();
  return computed(() => {
    const ids = unref(entityIds);
    return ids.map(id => {
      const entity = state.value.entities[id];
      if (!entity) {
        throw new Error(`Entity with ID ${id} not found in the game state.`);
      }
      return entity as unknown as T;
    });
  });
};

export const usePlayer = (playerId: MaybeRef<string>) => {
  return useEntity<PlayerViewModel>(playerId);
};

export const useCard = (cardId: MaybeRef<string>) => {
  return useEntity<CardViewModel>(cardId);
};

export const useFxEvent = <T extends FXEvent>(
  name: T,
  handler: (eventArg: FXEventMap[T]) => MaybePromise<void>
) => {
  const { client } = useGameClient();

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
