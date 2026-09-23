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

export type TutorialStatus = 'initializing' | 'active' | 'finished' | 'disposed';

export type TutorialCheckpoint = {
  id: string;
  stepId: string;
  stepIndex: number;
  history: SerializedInput[];
  reset: (game: Game, client: GameClient) => MaybePromise<void>;
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

  private currentStepIndex = 0;

  private isDispatching = false;

  private _status: TutorialStatus = 'initializing';

  private _attemptCount = 0;

  private _lastError: string | null = null;

  private checkpoint: TutorialCheckpoint | null = null;

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

  get status() {
    return this._status;
  }

  get attemptCount() {
    return this._attemptCount;
  }

  get lastError() {
    return this._lastError;
  }

  get progress() {
    return {
      current: this.currentStepIndex + 1,
      total: Object.keys(this.steps).length
    };
  }

  get hasCheckpoint() {
    return this.checkpoint !== null;
  }

  async initialize(client: GameClient) {
    if (this._status !== 'initializing') return;
    this.client = client;
    await this.currentStep.onEnter?.(this.game, this.currentStep);
    this._status = 'active';
  }

  async dispatch(input: SerializedInput) {
    if (this._status !== 'active' || this.isDispatching) return;

    this.isDispatching = true;
    this._attemptCount++;
    const step = this.steps[this.currentStepId];
    const result = step.validate(input);

    try {
      if (result.status === 'success') {
        this._lastError = null;
        await this.game.dispatch(input);
        const next = step.next(input);
        await step.onSuccess?.(this.game, input, next ? this.steps[next] : null);

        if (isDefined(next)) {
          this.currentStepId = next;
          this.currentStepIndex++;
          await this.currentStep.onEnter?.(this.game, this.currentStep);
        } else {
          this.isFinished = true;
          this._status = 'finished';
        }
      } else if (result.status === 'error') {
        this._lastError = result.errorMessage;
        await step.onFail?.(this.game, input, result.errorMessage);
      }
    } finally {
      this.isDispatching = false;
    }
  }

  setCheckpoint(reset: TutorialCheckpoint['reset'], id = this.currentStepId) {
    if (this._status !== 'active') return;

    this.checkpoint = {
      id,
      stepId: this.currentStepId,
      stepIndex: this.currentStepIndex,
      history: this.game.inputSystem.serialize(),
      reset
    };
  }

  async resetToCheckpoint() {
    if (
      (this._status !== 'active' && this._status !== 'finished') ||
      this.isDispatching ||
      this.checkpoint === null
    ) {
      return false;
    }

    this.isDispatching = true;
    try {
      await this.checkpoint.reset(this.game, this.client);
      this.currentStepId = this.checkpoint.stepId;
      this.currentStepIndex = this.checkpoint.stepIndex;
      this._attemptCount = 0;
      this._lastError = null;
      this.isFinished = false;
      this._status = 'active';
      await this.currentStep.onEnter?.(this.game, this.currentStep);
      return true;
    } finally {
      this.isDispatching = false;
    }
  }

  dispose() {
    this._status = 'disposed';
    this.isDispatching = false;
  }
}
