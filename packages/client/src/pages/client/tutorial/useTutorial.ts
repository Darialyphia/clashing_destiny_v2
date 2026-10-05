import type { InjectionKey, Ref } from 'vue';
import type {
  GameClient,
  NetworkAdapter
} from '@game/engine/src/client/client';
import { type GameOptions } from '@game/engine/src/game/game';
import {
  TutorialV2,
  type TutorialOptions,
  type TutorialStep,
  type TutorialTextBox
} from '@game/engine/src/tutorial/v2/tutorial';
import { useFxAdapter } from '@/game/composables/useFxAdapter';
import { provideGameClient } from '@/game/composables/useGameClient';
import type { Nullable, Override } from '@game/shared';
import { useSafeInject } from '@/shared/composables/useSafeInject';

type ClientTutorialTextBox = TutorialTextBox & {
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  centered?: { x?: boolean; y?: boolean };
};

export type UseTutorialOptions = Override<
  TutorialOptions,
  {
    gameOptions: Pick<
      GameOptions,
      'players' | 'rngSeed' | 'history' | 'overrides'
    >;
    steps: Array<
      Override<
        TutorialStep,
        {
          textBoxes: Array<ClientTutorialTextBox>;
        }
      >
    >;
  }
>;

export type TutorialContext = {
  client: Ref<GameClient>;
  tutorial: Ref<TutorialV2>;
  currentStep: Ref<TutorialStep | null>;
  currentStepTextBox: Ref<Nullable<ClientTutorialTextBox>>;
  currentStepError: Ref<string | null>;
  next: () => Promise<void>;
  status: Ref<string | null>;
  start: () => Promise<void>;
};

export const TUTORIAL_INJECTION_KEY = Symbol(
  'TutorialContext'
) as InjectionKey<TutorialContext>;

export const provideTutorial = (options: UseTutorialOptions) => {
  const tutorial = ref() as Ref<TutorialV2>;

  const networkAdapter: NetworkAdapter = {
    dispatch: input => {
      return tutorial.value.dispatch(input);
    },
    subscribe(cb) {
      return tutorial.value.onSnapshot(cb);
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
  let isDisposed = false;

  tutorial.value = new TutorialV2({
    gameOptions: {
      ...options.gameOptions,
      id: 'tutorial'
    },
    steps: options.steps,
    meta: {}
  });

  tutorial.value.onEnterStep(async ctx => {
    currentStep.value = ctx.currentStep;
    currentStepTextboxIndex.value = 0;
    await currentStepTextBox.value?.onEnter?.(tutorial.value.ctx);
  });
  // @ts-expect-error
  window.__debugGame = () => {
    console.log(tutorial.value.ctx.game);
  };
  // @ts-expect-error
  window.__debugClient = () => {
    console.log(tutorial.value.ctx);
  };

  const stopClientUpdate = client.value.onUpdate(() => {
    triggerRef(tutorial);
  });

  const advanceTextBox = async () => {
    if (isDisposed) return;
    currentStepTextboxIndex.value++;
    await currentStepTextBox.value?.onEnter?.(tutorial.value.ctx);
  };

  onUnmounted(() => {
    isDisposed = true;
    stopClientUpdate?.();
  });

  const ctx: TutorialContext = {
    client,
    tutorial,
    currentStep,
    currentStepTextBox,
    currentStepError,
    next: advanceTextBox,
    start: async () => {
      await tutorial.value.initialize(client.value);
      const snapshot = await tutorial.value.start();
      await client.value.initialize(snapshot);
    },
    status: computed(() => tutorial.value.status)
  };

  provide(TUTORIAL_INJECTION_KEY, ctx);

  return ctx;
};

export const useTutorial = () => useSafeInject(TUTORIAL_INJECTION_KEY);
