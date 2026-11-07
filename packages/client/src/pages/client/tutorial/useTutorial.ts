import type { InjectionKey, Ref } from 'vue';
import type {
  GameClient,
  NetworkAdapter
} from '@game/engine/src/client/client';
import { type GameOptions } from '@game/engine/src/game/game';
import {
  TutorialV2,
  TUTORIAL_STATUSES,
  type TutorialContext,
  type TutorialOptions,
  type TutorialStep,
  type TutorialTextBox
} from '@game/engine/src/tutorial/v2/tutorial';
import { GAME_PHASES } from '@game/engine/src/game/game.enums';
import { useFxAdapter } from '@/game/composables/useFxAdapter';
import {
  provideGameClient,
  useGameState,
  useMyPlayer
} from '@/game/composables/useGameClient';
import type { Nullable, Override } from '@game/shared';
import { useSafeInject } from '@/shared/composables/useSafeInject';

type ClientTutorialTextBox = TutorialTextBox & {
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  centered?: { x?: boolean; y?: boolean };
  gesture?: {
    from: (ctx: TutorialContext) => Nullable<HTMLElement>;
    to: (ctx: TutorialContext) => Nullable<HTMLElement>;
  };
  hideDuringOpponentInitiative?: boolean;
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
    boardType: 'single' | 'single-no-supply' | 'double';
  }
>;

export type UseTutorialContext = {
  client: Ref<GameClient>;
  tutorial: Ref<TutorialV2>;
  currentStep: Ref<TutorialStep | null>;
  currentStepTextBox: Ref<Nullable<ClientTutorialTextBox>>;
  currentStepError: Ref<string | null>;
  next: () => Promise<void>;
  status: Ref<string | null>;
  isCurrentStepFailed: Ref<boolean>;
  isGameOver: Ref<boolean>;
  // changes every time the game is recreated by a retry, components holding game state can use it as a key
  gameKey: Ref<number>;
  start: () => Promise<void>;
  retry: () => Promise<void>;
};

export const TUTORIAL_INJECTION_KEY = Symbol(
  'TutorialContext'
) as InjectionKey<UseTutorialContext>;

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
  const gameKey = ref(0);
  let isDisposed = false;

  tutorial.value = new TutorialV2({
    gameOptions: {
      ...options.gameOptions,
      id: 'tutorial'
    },
    steps: options.steps,
    meta: {}
  });

  // On a retry the player has already read the step's explanations: skip to its first box that asks for an action.
  // The skipped boxes' onEnter still runs, in order, since it can set up the board or script the opponent.
  const getFirstTextBoxIndex = (step: TutorialStep, isRetry: boolean) => {
    if (!isRetry) return 0;
    const firstActionIndex = step.textBoxes.findIndex(
      box => !box.canManuallyAdvance
    );
    return Math.max(firstActionIndex, 0);
  };

  tutorial.value.onEnterStep(async ctx => {
    currentStep.value = ctx.currentStep;
    const firstIndex = getFirstTextBoxIndex(
      ctx.currentStep,
      ctx.retryCount > 0
    );
    // no box is displayed while the skipped ones run
    currentStepTextboxIndex.value = -1;
    for (const box of ctx.currentStep.textBoxes.slice(0, firstIndex)) {
      await box.onEnter?.(tutorial.value.ctx);
    }
    currentStepTextboxIndex.value = firstIndex;
    await currentStepTextBox.value?.onEnter?.(tutorial.value.ctx);
  });
  tutorial.value.onValidation(result => {
    if (!result.isValid) {
      // the choice modal waits for the game once a choice is sent, let the player choose again
      client.value.optimisticStateManager.clearChooseCardSelection();
      currentStepError.value = result.reason || 'Invalid input';
      setTimeout(() => {
        currentStepError.value = null;
      }, 3000);
    }
  });
  // @ts-expect-error
  window.__debugGame = () => {
    console.log(tutorial.value.ctx.game);
  };
  // @ts-expect-error
  window.__debugClient = () => {
    tutorial.value.inspect();
  };
  // @ts-expect-error
  window.__debug = {
    tutorial: () => tutorial.value,
    client: () => client.value,
    currentStep: () => currentStep.value
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

  const ctx: UseTutorialContext = {
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
    retry: async () => {
      currentStepError.value = null;
      const snapshot = await tutorial.value.retry();
      await client.value.initialize(snapshot);
      gameKey.value++;
    },
    gameKey,
    isGameOver: computed(
      () =>
        tutorial.value.ctx.game.gamePhaseSystem.getState() ===
        GAME_PHASES.GAME_END
    ),
    status: computed(() => tutorial.value.status),
    // the engine checks the step's failedCondition after each input and flags the tutorial as failed
    isCurrentStepFailed: computed(
      () => tutorial.value.status === TUTORIAL_STATUSES.FAILED
    )
  };

  provide(TUTORIAL_INJECTION_KEY, ctx);

  return ctx;
};

export const useTutorial = () => useSafeInject(TUTORIAL_INJECTION_KEY);

/**
 * Whether the current text box, and its gesture, should be hidden right now.
 */
export const useIsCurrentTextBoxHidden = () => {
  const { currentStepTextBox, tutorial } = useTutorial();
  const state = useGameState();
  const myPlayer = useMyPlayer();

  return computed(() => {
    if (!currentStepTextBox.value) return true;
    if (!currentStepTextBox.value.hideDuringOpponentInitiative) return false;
    // the client state lags behind the game while it plays animations, so check both:
    // the box stays hidden from the moment the opponent gets the initiative until its actions are done animating
    const engineInitiativePlayer =
      tutorial.value.ctx.game.turnSystem.initiativePlayer.id;
    return (
      state.value.turn.initiativePlayer !== myPlayer.value.id ||
      engineInitiativePlayer !== myPlayer.value.id
    );
  });
};
