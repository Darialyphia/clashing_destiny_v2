import { isDefined, type MaybePromise, type Nullable } from '@game/shared';
import type { Game } from '../../game/game';
import type { SerializedInput } from '../../input/input-system';

export type TutorialStepValidationResult =
  | {
      status: 'success';
    }
  | {
      status: 'error';
      errorMessage: string;
    };

export type TutorialStep = {
  id: number;
  textBoxes: string[];
  validate(input: SerializedInput): TutorialStepValidationResult;
  onSuccess?(game: Game, input: SerializedInput): MaybePromise<void>;
  onFail?(game: Game, input: SerializedInput, errorMessage: string): MaybePromise<void>;
  next: (input: SerializedInput) => Nullable<number>;
};

export class Tutorial {
  private currentStepId = 0;

  private isFinished = false;

  constructor(
    private game: Game,
    private steps: Record<string, TutorialStep>
  ) {}

  get currentStep() {
    return this.steps[this.currentStepId];
  }

  async dispatch(input: SerializedInput) {
    if (this.isFinished) return;
    const step = this.steps[this.currentStepId];
    const result = step.validate(input);

    if (result.status === 'success') {
      await this.game.dispatch(input);
      await step.onSuccess?.(this.game, input);
      const next = step.next(input);
      if (isDefined(next)) {
        this.currentStepId = next;
      } else {
        this.isFinished = true;
      }
    } else if (result.status === 'error') {
      await step.onFail?.(this.game, input, result.errorMessage);
    }
  }
}
