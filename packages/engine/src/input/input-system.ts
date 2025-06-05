import {
  assert,
  isDefined,
  type AnyFunction,
  type Constructor,
  type Nullable,
  type Prettify,
  type Values
} from '@game/shared';
import { type Game } from '../game/game';
import type { DefaultSchema, Input } from './input';
import { System } from '../system';
import { z } from 'zod';
import {
  GAME_EVENTS,
  GameErrorEvent,
  GameInputQueueFlushedEvent,
  GameInputEvent,
  GameInputRequiredEvent
} from '../game/game.events';

import { PlayDestinyCardInput } from './inputs/play-destiny-card.input';
import { GameNotPausedError, InputError } from './input-errors';
import { DeclareAttackInput } from './inputs/declare-attack.input';
import { DeclareBlockerInput } from './inputs/declare-blocker.input';
import { DeclareEndTurnInput } from './inputs/declare-end-turn.input';
import { PassChainInput } from './inputs/pass-chain.input';
import { SelectCardOnBoardInput } from './inputs/select-card-on-board.input';
import { SelectMinionSlotInput } from './inputs/select-minion-slot.input';
import { CommitMinionSlotSelectionInput } from './inputs/commit-minion-slot-selection.input';
import { CommitCardSelectionInput } from './inputs/commit-card-selection.input';
import { ChooseCardsInput } from './inputs/choose-cards.input';
import { UseCardAbilityInput } from './inputs/use-card-ability.input';
import { DeclarePlayCardInput } from './inputs/declare-play-card.input';
import { CancelPlayCardInput } from './inputs/cancel-play-card.input';
import { CommitPlayCardInput } from './inputs/commit-play-card';
import { DeclareAttackTargetInput } from './inputs/declare-attack-target.input';

type GenericInputMap = Record<string, Constructor<Input<DefaultSchema>>>;

type ValidatedInputMap<T extends GenericInputMap> = {
  [Name in keyof T & string]: T[Name] extends Constructor<Input<DefaultSchema>>
    ? Name extends InstanceType<T[Name]>['name']
      ? T[Name]
      : `input map mismatch: expected ${Name}, but Input name is ${InstanceType<T[Name]>['name']}`
    : `input type mismatch: expected Input constructor`;
};

const validateinputMap = <T extends GenericInputMap>(data: ValidatedInputMap<T>) => data;

const inputMap = validateinputMap({
  declarePlayCard: DeclarePlayCardInput,
  cancelPlayCard: CancelPlayCardInput,
  commitPlayCard: CommitPlayCardInput,
  playDestinyCard: PlayDestinyCardInput,
  declareAttack: DeclareAttackInput,
  declareAttackTarget: DeclareAttackTargetInput,
  declareBlocker: DeclareBlockerInput,
  declareEndTurn: DeclareEndTurnInput,
  passChain: PassChainInput,
  selectCardOnBoard: SelectCardOnBoardInput,
  selectMinionSlot: SelectMinionSlotInput,
  commitMinionSlotSelection: CommitMinionSlotSelectionInput,
  commitCardSelection: CommitCardSelectionInput,
  chooseCards: ChooseCardsInput,
  useCardAbility: UseCardAbilityInput
});

type InputMap = typeof inputMap;

type UnpauseCallback<T> = (data: T) => void;

export type SerializedInput = Prettify<
  Values<{
    [Name in keyof InputMap]: {
      type: Name;
      payload: InstanceType<InputMap[Name]> extends Input<infer Schema>
        ? z.infer<Schema>
        : never;
    };
  }>
>;
export type InputDispatcher = (input: SerializedInput) => void;

export type InputSystemOptions = { game: Game };

export class InputSystem extends System<SerializedInput[]> {
  private history: Input<any>[] = [];

  private isRunning = false;

  private queue: AnyFunction[] = [];

  private _currentAction?: Nullable<InstanceType<Values<typeof inputMap>>> = null;

  private onUnpause: UnpauseCallback<any> | null = null;

  get currentAction() {
    return this._currentAction;
  }

  get isPaused() {
    return isDefined(this.onUnpause);
  }

  async initialize(rawHistory: SerializedInput[]) {
    for (const input of rawHistory) {
      await this.schedule(() => this.handleInput(input));
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  shutdown() {}

  private isActionType(type: string): type is keyof typeof inputMap {
    return Object.keys(inputMap).includes(type);
  }

  private addToHistory(input: Input<any>) {
    const ignored: Constructor<Input<any>>[] = [];
    if (ignored.includes(input.constructor as Constructor<Input<any>>)) return;

    this.history.push(input);
  }

  async schedule(fn: AnyFunction) {
    this.queue.push(fn);
    if (!this.isRunning) {
      await this.flushSchedule();
    }
  }

  pause<T>() {
    return new Promise<T>(resolve => {
      this.onUnpause = data => {
        this.onUnpause = null;
        resolve(data);
      };

      void this.askForPlayerInput();
    });
  }

  unpause<T>(data: T) {
    assert(this.isPaused, new GameNotPausedError());

    this.onUnpause?.(data);
  }

  private async flushSchedule() {
    if (this.isRunning) {
      console.warn('already flushing !');
      return;
    }
    this.isRunning = true;
    try {
      while (this.queue.length) {
        const fn = this.queue.shift();
        fn!();
      }
      this.isRunning = false;
      this.game.snapshotSystem.takeSnapshot();
      await this.game.emit(
        'game.input-queue-flushed',
        new GameInputQueueFlushedEvent({})
      );
    } catch (err) {
      await this.handleError(err);
    }
  }

  private async handleError(err: unknown) {
    console.groupCollapsed('%c[INPUT SYSTEM]: ERROR', 'color: #ff0000');
    console.error(err);
    console.groupEnd();

    const serialized = this.game.serialize();
    if (this._currentAction) {
      serialized.history.push(this._currentAction.serialize() as SerializedInput);
    }
    await this.game.emit(
      'game.error',
      new GameErrorEvent({ error: err as Error, debugDump: serialized })
    );

    // this means the error got caught during player input validation, the game state is not corrupted but clients might need to resync
    if (err instanceof InputError) {
      this.isRunning = false;
      this.queue = [];
      this._currentAction = null;
      this.game.snapshotSystem.takeSnapshot();
      await this.game.emit(GAME_EVENTS.FLUSHED, new GameInputQueueFlushedEvent({}));
    }
  }

  async dispatch(input: SerializedInput) {
    console.groupCollapsed(`[InputSystem]: ${input.type}`);
    console.log(input);
    console.groupEnd();
    if (!this.isActionType(input.type)) return;

    if (this.isPaused) {
      // if the game is paused, run the input immediately
      await this.handleInput(input);
    } else {
      // let the current input fully resolve, then schedule
      // the currentinput could schedule new actions, so we need to wait for the flush
      this.game.once(GAME_EVENTS.FLUSHED, () =>
        this.schedule(() => this.handleInput(input))
      );
    }
  }

  async handleInput(arg: SerializedInput) {
    const { type, payload } = arg;
    if (!this.isActionType(type)) return;
    const ctor = inputMap[type];
    const input = new ctor(this.game, payload);
    const prevAction = this._currentAction;
    this._currentAction = input;
    await this.game.emit(GAME_EVENTS.INPUT_START, new GameInputEvent({ input }));

    input.execute();

    await this.game.emit(GAME_EVENTS.INPUT_END, new GameInputEvent({ input }));
    this.addToHistory(input);
    this._currentAction = prevAction;
  }

  getHistory() {
    return [...this.history];
  }

  async askForPlayerInput() {
    this.game.snapshotSystem.takeSnapshot();
    await this.game.emit(GAME_EVENTS.INPUT_REQUIRED, new GameInputRequiredEvent({}));
  }

  serialize() {
    return this.history.map(action => action.serialize()) as SerializedInput[];
  }
}
