import {
  assert,
  type AnyObject,
  type MaybePromise,
  type Nullable,
  type Values
} from '@game/shared';
import { Game, type GameOptions } from '../../game/game';
import type { GameClient } from '../../client/client';
import type { SerializedInput } from '../../input/input-system';
import type {
  GameStateSnapshot,
  PatchBasedSnapshotDiff,
  SerializedOmniscientState
} from '../../game/systems/game-snapshot.system';
import { GAME_EVENTS } from '../../game/game.events';

export const TUTORIAL_STATUSES = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  FAILED: 'failed',
  COMPLETED: 'completed'
} as const;

export type TutorialStatus = Values<typeof TUTORIAL_STATUSES>;

export type TutorialContext<T extends AnyObject = AnyObject> = {
  game: Game;
  client: GameClient;
  status: TutorialStatus;
  retryCount: number;
  currentStep: TutorialStep<T>;
  meta: T;
  next: () => Promise<void>;
};

export type TutorialTextBox<T extends AnyObject = AnyObject> = {
  onEnter?: (ctx: TutorialContext<T>) => MaybePromise<void>;
  text: string;
  anchor?: (ctx: TutorialContext<T>) => Nullable<HTMLElement>;
} & (
  | {
      canManuallyAdvance: true; // wether or not the player can click "next" to show the next text box
      advanceCondition?: never;
    }
  | {
      canManuallyAdvance?: false;
      canAdvance?: false;
      advanceCondition: (ctx: TutorialContext<T>) => boolean; // Determines if the condition are met to advance to the next textbox
    }
);

export type TutorialStepValidationResult =
  | {
      isValid: true;
    }
  | {
      isValid: false;
      reason: string;
    };

export type TutorialStepId = number;

export type TutorialStep<T extends AnyObject = AnyObject> = {
  id: TutorialStepId;
  meta: T;
  setup: (ctx: TutorialContext<T>) => MaybePromise<void>;
  teardown: (ctx: TutorialContext<T>) => MaybePromise<void>;
  textBoxes: TutorialTextBox<T>[];
  validateInput(
    input: SerializedInput,
    ctx: TutorialContext<T>
  ): TutorialStepValidationResult;
  getNextStep?: (ctx: TutorialContext<T>) => Nullable<TutorialStepId>;
  solveCondition: (ctx: TutorialContext<T>) => boolean; // Determines if the condition are met to go to the next step
  failedCondition: (ctx: TutorialContext<T>) => boolean; // Determines if the condition are met to fail the current step and ask to retry
  canRetry: (ctx: TutorialContext<T>) => boolean;
};

export type Tutorial<T extends AnyObject = AnyObject> = {
  currentStep: TutorialStep<T>;
  meta: T;
  initialize: (client: GameClient) => Promise<void>;
  start(): MaybePromise<GameStateSnapshot<SerializedOmniscientState>>;
  dispatch(input: SerializedInput): TutorialStepValidationResult;
  retry(): Promise<MaybePromise<GameStateSnapshot<SerializedOmniscientState>>>;
};

export type TutorialOptions<T extends AnyObject = AnyObject> = {
  gameOptions: GameOptions;
  steps: TutorialStep<T>[]; // the first step is the root, default order is the array order
  meta: T;
};

export class TutorialV2<T extends AnyObject = AnyObject> implements Tutorial<T> {
  private readonly gameOptions: GameOptions;

  private game: Game;

  private readonly steps: TutorialStep<T>[];

  private client!: GameClient;

  private stepIndex = 0;

  private _status: TutorialStatus = 'not_started';

  private _retryCount = 0;

  readonly meta: T;

  private historyForCurrentStep: SerializedInput[] = [];

  private snapshotCallbacks: Array<
    (snapshot: GameStateSnapshot<PatchBasedSnapshotDiff>) => void
  > = [];
  private enterStepCallbacks: Array<(ctx: TutorialContext<T>) => MaybePromise<void>> = [];
  private validationCallbacks: Array<
    (result: TutorialStepValidationResult, ctx: TutorialContext<T>) => MaybePromise<void>
  > = [];

  constructor(options: TutorialOptions<T>) {
    if (!options.steps.length) {
      throw new Error('Tutorial needs at least one step');
    }
    this.gameOptions = options.gameOptions;
    this.game = new Game(options.gameOptions);
    this.steps = options.steps;
    this.meta = options.meta;
    this.next = this.next.bind(this);
  }

  get ctx(): TutorialContext<T> {
    return {
      game: this.game,
      client: this.client,
      status: this._status,
      meta: this.meta,
      retryCount: this._retryCount,
      currentStep: this.currentStep,
      next: this.next
    };
  }

  get currentStep(): TutorialStep<T> {
    return this.steps[this.stepIndex];
  }

  get status() {
    return this._status;
  }

  get retryCount() {
    return this._retryCount;
  }

  onSnapshot(callback: (snapshot: GameStateSnapshot<PatchBasedSnapshotDiff>) => void) {
    this.snapshotCallbacks.push(callback);
  }

  onEnterStep(callback: (ctx: TutorialContext<T>) => MaybePromise<void>) {
    this.enterStepCallbacks.push(callback);
  }

  onValidation(
    callback: (
      result: TutorialStepValidationResult,
      ctx: TutorialContext<T>
    ) => MaybePromise<void>
  ) {
    this.validationCallbacks.push(callback);
  }

  async next() {
    await this.leaveStep();
    this.stepIndex++;
    this.historyForCurrentStep = this.game.inputSystem.serialize();
    this._retryCount = 0;
    void this.enterStep();
  }

  async initialize(client: GameClient) {
    this.client = client;
    await this.game.initialize();
    this.game.subscribeOmniscient(async snapshot => {
      for (const callback of this.snapshotCallbacks) {
        await callback(snapshot);
      }
    });
    this.game.on(GAME_EVENTS.INPUT_END, () => {
      const successful = this.currentStep.solveCondition(this.ctx);
      if (successful) {
        return this.next();
      }
      const unsuccessful = this.currentStep.failedCondition?.(this.ctx);
      if (unsuccessful) {
        this._retryCount++;
        this._status = TUTORIAL_STATUSES.FAILED;
      }
    });
  }

  private async enterStep() {
    await this.currentStep.setup(this.ctx);
    for (const callback of this.enterStepCallbacks) {
      await callback(this.ctx);
    }
    await this.game.snapshotSystem.takeSnapshot();
  }

  private async leaveStep() {
    await this.currentStep.teardown(this.ctx);
  }

  async start() {
    assert(this._status === TUTORIAL_STATUSES.NOT_STARTED);
    this._status = TUTORIAL_STATUSES.IN_PROGRESS;

    await this.enterStep();
    return this.game.snapshotSystem.getLatestOmniscientSnapshot();
  }

  async retry() {
    assert(
      this._status === TUTORIAL_STATUSES.IN_PROGRESS ||
        this._status === TUTORIAL_STATUSES.FAILED
    );
    this.game = new Game({ ...this.gameOptions, history: this.historyForCurrentStep });

    await this.game.initialize();
    this.game.subscribeOmniscient(async snapshot => {
      for (const callback of this.snapshotCallbacks) {
        await callback(snapshot);
      }
    });

    this._status = TUTORIAL_STATUSES.IN_PROGRESS;
    return this.game.snapshotSystem.getLatestOmniscientSnapshot();
  }

  dispatch(input: SerializedInput) {
    assert(this._status === TUTORIAL_STATUSES.IN_PROGRESS);

    const validationResult = this.currentStep.validateInput(input, this.ctx);
    for (const callback of this.validationCallbacks) {
      void callback(validationResult, this.ctx);
    }

    if (validationResult.isValid) {
      void this.game.dispatch(input);
    }

    return validationResult;
  }
}
