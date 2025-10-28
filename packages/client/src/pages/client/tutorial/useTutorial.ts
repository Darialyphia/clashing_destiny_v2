import type {
  GameClient,
  NetworkAdapter
} from '@game/engine/src/client/client';
import { Game, type GameOptions } from '@game/engine/src/game/game';
import { CARDS_DICTIONARY } from '@game/engine/src/card/sets';
import {
  Tutorial,
  type TutorialStep,
  type TutorialTextBox
} from '@game/engine/src/tutorial/tutorial';
import { useFxAdapter } from '@/game/composables/useFxAdapter';
import { provideGameClient } from '@/game/composables/useGameClient';
import type { Config } from '@game/engine/src/config';
import type {
  IndexedRecord,
  MaybePromise,
  Nullable,
  Override
} from '@game/shared';

type ClientTutorialTextBox = TutorialTextBox & {
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  centered?: { x?: boolean; y?: boolean };
};
export type UseTutorialOptions = Pick<
  GameOptions,
  'players' | 'rngSeed' | 'history'
> & {
  steps: IndexedRecord<
    Override<
      TutorialStep,
      {
        onEnter?(
          game: Game,
          step: TutorialStep,
          client: GameClient
        ): MaybePromise<void>;
        textBoxes: ClientTutorialTextBox[];
      }
    >,
    'id'
  >;
  setup: (game: Game, client: GameClient) => Promise<void>;
  config?: Partial<Config>;
  next?: string;
};

export const useTutorial = (options: UseTutorialOptions) => {
  const game = new Game({
    id: 'sandbox',
    rngSeed: options.rngSeed,
    history: options.history,
    overrides: {
      cardPool: CARDS_DICTIONARY,
      config: {
        SHUFFLE_DECK_ON_GAME_START: false,
        ...(options.config ?? {})
      }
    },
    players: options.players
  });

  // @ts-expect-error
  window.__debugGame = () => {
    console.log(game);
  };
  // @ts-expect-error
  window.__debugClient = () => {
    console.log(client.value);
  };
  const tutorial = ref() as Ref<Tutorial>;

  const networkAdapter: NetworkAdapter = {
    dispatch: input => {
      return tutorial.value.dispatch(input);
    },
    subscribe(cb) {
      game.subscribeOmniscient(cb);
    },
    sync(lastSnapshotId) {
      console.log('TODO: sync snapshots from sandbox', lastSnapshotId);
      return Promise.resolve([]);
    }
  };

  const fxAdapter = useFxAdapter();

  const { client } = provideGameClient({
    networkAdapter,
    fxAdapter,
    gameType: 'online',
    playerId: 'p1',
    isSpectator: false
  });

  const currentStep = ref<TutorialStep | null>(null);
  const currentStepTextboxIndex = ref(0);
  const currentStepTextBox = computed(() => {
    return (currentStep.value?.textBoxes[currentStepTextboxIndex.value] ||
      null) as Nullable<ClientTutorialTextBox>;
  });
  const currentStepError = ref<string | null>(null);

  tutorial.value = new Tutorial(
    game,
    Object.fromEntries(
      Object.entries(options.steps).map(([id, step]) => [
        id,
        {
          ...step,
          async onEnter(game, newStep) {
            await currentStepTextBox.value?.onLeave?.(game, client.value);
            currentStep.value = newStep;
            currentStepTextboxIndex.value = 0;
            await step.onEnter?.(game, newStep, client.value);
            await currentStepTextBox.value?.onEnter?.(game, client.value, next);
          },
          onFail(game, input, errorMessage) {
            currentStepError.value = errorMessage;
            return step.onFail?.(game, input, errorMessage);
          }
        }
      ])
    )
  );

  client.value.onUpdate(() => {
    triggerRef(tutorial);
  });

  (async function () {
    await game.initialize();
    await options.setup(game, client.value);
    await game.snapshotSystem.takeSnapshot();

    client.value.initialize(game.snapshotSystem.getOmniscientSnapshotAt(0));
    tutorial.value.initialize(client.value);
  })();

  const next = async () => {
    await currentStepTextBox.value?.onLeave?.(game, client.value);
    currentStepTextboxIndex.value++;
    await currentStepTextBox.value?.onEnter?.(game, client.value, next);
  };

  return {
    client,
    currentStep,
    currentStepTextBox,
    currentStepError,
    async next() {
      await currentStepTextBox.value?.onLeave?.(game, client.value);
      currentStepTextboxIndex.value++;
      await currentStepTextBox.value?.onEnter?.(game, client.value, next);
    },
    nextMission: options.next,
    isFinished: computed(() => {
      return tutorial.value.isFinished;
    })
  };
};
