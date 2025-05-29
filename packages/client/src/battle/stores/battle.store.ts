import { CellViewModel } from '@/board/cell.model';
import { CardViewModel } from '@/card/card.model';
import { InteractableViewModel } from '@/interactable/interactable.model';
import { PlayerViewModel } from '@/player/player.model';
import { ArtifactViewModel } from '@/unit/artifact.model';
import { ModifierViewModel } from '@/unit/modifier.model';
import { UnitViewModel } from '@/unit/unit.model';
import { GAME_PHASES } from '@game/engine/src/game/game.enums';
import {
  GAME_EVENTS,
  type GameEventMap
} from '@game/engine/src/game/game.events';
import type {
  EntityDictionary,
  GameStateSnapshot,
  SerializedOmniscientState,
  SerializedPlayerState
} from '@game/engine/src/game/systems/game-snapshot.system';
import type {
  InputDispatcher,
  SerializedInput
} from '@game/engine/src/input/input-system';
import { TypedEventEmitter } from '@game/engine/src/utils/typed-emitter';
import { type Override, type PartialBy, type Values } from '@game/shared';
import { defineStore } from 'pinia';
import { match } from 'ts-pattern';

export const GAME_TYPES = {
  LOCAL: 'local',
  ONLINE: 'online'
} as const;

export type GameType = Values<typeof GAME_TYPES>;

export type GameStateEntities = Record<
  string,
  | UnitViewModel
  | CellViewModel
  | PlayerViewModel
  | CardViewModel
  | ModifierViewModel
  | ArtifactViewModel
  | InteractableViewModel
>;
export type GameState = Override<
  SerializedOmniscientState,
  {
    entities: GameStateEntities;
  }
>;

export type PreBattleEvent<T extends keyof GameEventMap> = `pre_${T}`;
export type PreBattleEventKey<T extends keyof typeof GAME_EVENTS> = `PRE_${T}`;
export const BATTLE_EVENTS = {
  ...GAME_EVENTS,
  ...(Object.fromEntries(
    Object.entries(GAME_EVENTS).map(([key, value]) => [
      `PRE_${key}`,
      `pre_${value}`
    ])
  ) as unknown as {
    [Key in keyof typeof GAME_EVENTS as PreBattleEventKey<Key>]: PreBattleEvent<
      (typeof GAME_EVENTS)[Key]
    >;
  })
} as const;

type BattleEvent = Values<typeof BATTLE_EVENTS>;

export type BattleEventName =
  | keyof GameEventMap
  | PreBattleEvent<keyof GameEventMap>;

type SerializedGameEventMap = {
  [Key in BattleEventName]: Key extends PreBattleEvent<infer U>
    ? ReturnType<GameEventMap[U]['serialize']>
    : Key extends keyof GameEventMap
      ? ReturnType<GameEventMap[Key]['serialize']>
      : never;
};

const buildentities = (
  entities: EntityDictionary,
  existing: GameStateEntities,
  dispatcher: InputDispatcher
): GameState['entities'] => {
  const now = performance.now();
  for (const [id, entity] of Object.entries(entities)) {
    existing[id] = match(entity)
      .with(
        { entityType: 'unit' },
        entity => new UnitViewModel(entity, existing, dispatcher)
      )
      .with(
        { entityType: 'cell' },
        entity => new CellViewModel(entity, existing, dispatcher)
      )
      .with(
        { entityType: 'player' },
        entity => new PlayerViewModel(entity, existing, dispatcher)
      )
      .with(
        { entityType: 'card' },
        entity => new CardViewModel(entity, existing, dispatcher)
      )
      .with(
        { entityType: 'modifier' },
        entity => new ModifierViewModel(entity, existing, dispatcher)
      )
      .with(
        { entityType: 'artifact' },
        entity => new ArtifactViewModel(entity, existing, dispatcher)
      )
      .with(
        { entityType: 'interactable' },
        entity => new InteractableViewModel(entity, existing, dispatcher)
      )
      .exhaustive();
  }
  return existing;
};

export const useBattleStore = defineStore('battle', () => {
  const fxEmitter = new TypedEventEmitter<SerializedGameEventMap>(true);

  const isPlayingFx = ref(false);
  const isReady = ref(false);

  let dispatch: InputDispatcher = () => {};

  const playerId = ref<string | undefined>();

  const gameType = ref<GameType>();
  const state = ref<GameState>();

  return {
    init({
      subscriber,
      dispatcher,
      initialState,
      type,
      id
    }: {
      subscriber: (
        onSnapshot: (
          snapshot: GameStateSnapshot<
            SerializedOmniscientState | SerializedPlayerState
          >
        ) => void | Promise<void>
      ) => void;
      dispatcher: InputDispatcher;
      initialState: SerializedOmniscientState | SerializedPlayerState;
      type: GameType;
      id?: string;
    }) {
      playerId.value = id;
      dispatch = dispatcher;
      gameType.value = type;
      state.value = {
        ...initialState,
        entities: buildentities(initialState.entities, {}, dispatch)
      };
      let lastSnapshotId = -1;
      subscriber(async snapshot => {
        if (snapshot.id <= lastSnapshotId) {
          console.log(
            `Stale snapshot, latest is ${lastSnapshotId}, received is ${snapshot.id}`
          );
          return;
        }
        lastSnapshotId = snapshot.id;

        try {
          isPlayingFx.value = true;

          for (const event of snapshot.events) {
            await fxEmitter.emitAsync(
              `pre_${event.eventName}`,
              event.event as any
            );
            await fxEmitter.emitAsync(event.eventName, event.event as any);
          }
          isPlayingFx.value = false;

          if (!state.value) throw new Error('State not initialized');

          if (snapshot.id >= lastSnapshotId) {
            state.value.entities = buildentities(
              snapshot.state.entities,
              { ...toRaw(state.value!.entities) },
              dispatch
            );

            state.value.board = snapshot.state.board;
            state.value.players = snapshot.state.players;
            state.value.turnPlayer = snapshot.state.turnPlayer;
            state.value.phase = snapshot.state.phase;
            state.value.interactables = snapshot.state.interactables;
            state.value.units = snapshot.state.units;
            state.value.isOverdriveMode = snapshot.state.isOverdriveMode;
            state.value.interactionState = snapshot.state.interactionState;
            state.value.turnCount = snapshot.state.turnCount;
            state.value.turnPlayer = snapshot.state.turnPlayer;
          }

          if (gameType.value === GAME_TYPES.LOCAL) {
            playerId.value = state.value!.turnPlayer;
          }
        } catch (err) {
          console.error(err);
        }
      });

      fxEmitter.on(GAME_EVENTS.AFTER_GAME_PHASE_CHANGE, async e => {
        state.value!.phase = e.to;
      });

      isReady.value = true;
    },
    dispatch<T extends SerializedInput['type']>(input: {
      type: T;
      payload: PartialBy<
        (SerializedInput & { type: T })['payload'],
        'playerId'
      >;
    }) {
      dispatch({
        type: input.type,
        // @ts-expect-error distributive union issue blablabla
        payload: {
          playerId: playerId.value,
          ...input.payload
        }
      });
    },
    gameType,
    isReady,
    isPlayingFx: readonly(isPlayingFx),
    playerId,
    state,
    on<T extends keyof SerializedGameEventMap>(
      eventName: T,
      handler: (eventArg: SerializedGameEventMap[T]) => Promise<void>
    ) {
      return fxEmitter.on(eventName, handler);
    },

    once<T extends keyof GameEventMap>(
      eventName: T,
      handler: (eventArg: SerializedGameEventMap[T]) => Promise<void>
    ) {
      return fxEmitter.once(eventName, handler);
    },

    off<T extends keyof GameEventMap>(
      eventName: T,
      handler: (eventArg: SerializedGameEventMap[T]) => Promise<void>
    ) {
      return fxEmitter.off(eventName, handler);
    }
  };
});

export const useBattleEvent = <T extends BattleEvent>(
  name: T,
  handler: (eventArg: SerializedGameEventMap[T]) => Promise<void>
) => {
  const store = useBattleStore();

  const unsub = store.on(name, handler);

  onUnmounted(unsub);

  return unsub;
};

export const useDispatcher = () => {
  const store = useBattleStore();

  return store.dispatch;
};

export const useGameState = () => {
  const store = useBattleStore();

  return {
    gameType: computed(() => store.gameType),
    state: computed(() => store.state!)
  };
};

export const useGameType = () => {
  const store = useBattleStore();

  return computed(() => store.gameType);
};

export const usePlayers = () => {
  const { state } = useGameState();

  return computed(() =>
    state.value.players.map(p => state.value.entities[p] as PlayerViewModel)
  );
};

export const useCells = () => {
  const { state } = useGameState();

  return computed(() =>
    state.value.board.cells.map(c => state.value.entities[c] as CellViewModel)
  );
};

export const useUnits = () => {
  const { state } = useGameState();

  return computed(() =>
    state.value.units.map(u => state.value.entities[u] as UnitViewModel)
  );
};

export const useCards = () => {
  const { state } = useGameState();

  return computed(() =>
    Object.values(state.value.entities).filter(e => e instanceof CardViewModel)
  );
};

export const useModifiers = () => {
  const { state } = useGameState();

  return computed(() =>
    Object.values(state.value.entities).filter(
      e => e instanceof ModifierViewModel
    )
  );
};

export const useTurnPlayer = () => {
  const { state } = useGameState();

  return computed(
    () => state.value.entities[state.value.turnPlayer] as PlayerViewModel
  );
};

export const useUserPlayer = () => {
  const store = useBattleStore();
  const players = usePlayers();
  const turnPlayer = useTurnPlayer();

  return computed(() => {
    return match(store.gameType)
      .with(GAME_TYPES.LOCAL, () => {
        return turnPlayer.value;
      })
      .with(GAME_TYPES.ONLINE, () => {
        return store.playerId
          ? players.value.find(p => p.id === store.playerId)!
          : players.value.find(p => p.id === turnPlayer.value.id)!;
      })
      .otherwise(() => {
        throw new Error('Invalid game type');
      });
  });
};

export const useOpponentPlayer = () => {
  const store = useBattleStore();
  const players = usePlayers();
  const turnPlayer = useTurnPlayer();

  return computed(() =>
    store.playerId
      ? players.value.find(p => p.id !== store.playerId)!
      : players.value.find(p => p.id !== turnPlayer.value.id)!
  );
};
