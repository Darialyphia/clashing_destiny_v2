import type { AnyObject, MaybePromise, Nullable } from '@game/shared';
import type { Game } from '../../game/game';
import type { GameClient } from '../../client/client';
import type { SerializedInput } from '../../input/input-system';

export type TutorialStatus =
  | 'not_started'
  | 'in_progress'
  | 'transitioning'
  | 'failed'
  | 'completed';

export type TutorialContext = {
  game: Game;
  client: GameClient;
  status: TutorialStatus;
  retryCount: number;
  currentStep: TutorialStep;
  next: () => MaybePromise<void>; // manually goes to the next step
};

export type TutorialTextBox = {
  onEnter?: (ctx: TutorialContext) => MaybePromise<void>;
  text: string;
  anchor?: (ctx: TutorialContext) => Nullable<HTMLElement>;
} & (
  | {
      canManuallyAdvance: true; // wether or not the player can click "next" to show the next text box
      advanceCondition?: never;
    }
  | {
      canManuallyAdvance?: false;
      canAdvance?: false;
      advanceCondition: (ctx: TutorialContext) => boolean; // Determines if the condition are met to advance to the next textbox
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
  setup: (ctx: TutorialContext) => MaybePromise<void>;
  teardown: (ctx: TutorialContext) => MaybePromise<void>;
  textBoxes: TutorialTextBox[];
  validateInput(
    input: SerializedInput,
    ctx: TutorialContext
  ): TutorialStepValidationResult;
  getNextStep?: (ctx: TutorialContext) => Nullable<TutorialStepId>;
  solveCondition: (ctx: TutorialContext) => boolean; // Determines if the condition are met to go to the next step
  failedCondition: (ctx: TutorialContext) => boolean; // Determines if the condition are met to fail the current step and ask to retry
  canRetry: (ctx: TutorialContext) => boolean;
};

export type Tutorial<T extends AnyObject = AnyObject> = {
  currentStep: TutorialStep<T>;
  meta: T;
  initialize: (client: GameClient) => Promise<void>;
  start(): MaybePromise<void>;
  dispatch(input: SerializedInput): Promise<TutorialStepValidationResult>;
  retry(): Promise<void>; // retry from the start of the current step
};
