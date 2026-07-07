import { isDefined, type MaybePromise, type Nullable } from '@game/shared';
import type { Game } from '../game/game';
import type { SerializedInput } from '../input/input-system';
import type { GameClient } from '../client/client';

export type TutorialStepValidationResult =
  | {
      status: 'success';
    }
  | {
      status: 'error';
      errorMessage: string;
    };

export type TutorialTextBox = {
  onEnter?: (game: Game, client: GameClient, next: () => void) => MaybePromise<void>;
  onLeave?: (game: Game, client: GameClient) => MaybePromise<void>;
  text: string;
  canGoNext: boolean;
};

export type TutorialStep = {
  id: string;
  isRoot: boolean;
  textBoxes: TutorialTextBox[];
  validate(input: SerializedInput): TutorialStepValidationResult;
  onEnter?(game: Game, step: TutorialStep): MaybePromise<void>;
  onSuccess?(
    game: Game,
    input: SerializedInput,
    nextStep: Nullable<TutorialStep>
  ): MaybePromise<void>;
  onFail?(game: Game, input: SerializedInput, errorMessage: string): MaybePromise<void>;
  next: (input: SerializedInput) => Nullable<string>;
};

export class Tutorial {
  private currentStepId: string;

  isFinished = false;

  private client!: GameClient;

  constructor(
    private game: Game,
    private steps: Record<string, TutorialStep>
  ) {
    const initialStep = Object.values(steps).find(step => step.isRoot);
    if (!initialStep) {
      throw new Error('No initial step found');
    }
    this.currentStepId = initialStep.id;
  }

  get currentStep() {
    return this.steps[this.currentStepId];
  }

  async initialize(client: GameClient) {
    this.client = client;
    await this.currentStep.onEnter?.(this.game, this.currentStep);
  }

  async dispatch(input: SerializedInput) {
    if (this.isFinished) return;
    const step = this.steps[this.currentStepId];
    const result = step.validate(input);

    if (result.status === 'success') {
      await this.game.dispatch(input);
      const next = step.next(input);
      await step.onSuccess?.(this.game, input, next ? this.steps[next] : null);

      if (isDefined(next)) {
        this.currentStepId = next;
        await this.currentStep.onEnter?.(this.game, this.currentStep);
      } else {
        this.isFinished = true;
      }
    } else if (result.status === 'error') {
      await step.onFail?.(this.game, input, result.errorMessage);
    }
  }
}
