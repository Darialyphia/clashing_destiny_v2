import type { NetworkAdapter } from '@game/engine/src/client/client';
import { Game, type GameOptions } from '@game/engine/src/game/game';
import { provideGameClient } from './useGameClient';
import { CARDS_DICTIONARY } from '@game/engine/src/card/sets';
import { useFxAdapter } from './useFxAdapter';
import {
  Tutorial,
  type TutorialStep
} from '@game/engine/src/ai/tutorial/tutorial';

export const useTutorial = (
  options: Pick<GameOptions, 'players' | 'rngSeed'> & {
    steps: Record<string, TutorialStep>;
  }
) => {
  const game = new Game({
    id: 'sandbox',
    rngSeed: options.rngSeed,
    history: [],
    overrides: {
      cardPool: CARDS_DICTIONARY
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

  const client = provideGameClient({
    networkAdapter,
    fxAdapter,
    gameType: 'local',
    playerId: 'p1'
  });

  const currentStep = ref<TutorialStep | null>(null);
  const currentStepTextboxIndex = ref(0);
  const currentStepTextBox = computed(() => {
    return currentStep.value?.textBoxes[currentStepTextboxIndex.value] || null;
  });
  tutorial.value = new Tutorial(
    game,
    Object.fromEntries(
      Object.entries(options.steps).map(([id, step]) => [
        id,
        {
          ...step,
          onSuccess(game, input, nextStep) {
            currentStep.value = nextStep ?? null;
            return step.onSuccess?.(game, input, nextStep);
          }
        }
      ])
    )
  );

  game.initialize().then(() => {
    client.value.initialize(game.snapshotSystem.getLatestOmniscientSnapshot());
  });

  client.value.onUpdate(() => {
    triggerRef(tutorial);
  });

  return {
    client,
    currentStep,
    currentStepTextBox,
    async next() {
      await currentStepTextBox.value?.onLeave?.();
      currentStepTextboxIndex.value++;
      await currentStepTextBox.value?.onEnter?.();
    }
  };
};
