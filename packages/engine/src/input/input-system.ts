import {
  assert,
  isDefined,
  waitFor,
  type AnyFunction,
  type Constructor,
  type Nullable,
  type Prettify,
  type Values
} from '@game/shared';
import { type Game } from '../game/game';
import type { Input } from './input';
import { System } from '../system';
import { z, ZodType } from 'zod';
import {
  GAME_EVENTS,
  GameErrorEvent,
  GameInputQueueFlushedEvent,
  GameInputEvent
} from '../game/game.events';
import { GameNotPausedError, InputError } from './input-errors';
import { CommitSpaceSelectionInput } from './inputs/commit-space-selection.input';
import { ChooseCardsInput } from './inputs/choose-cards.input';
import { PlayCardInput } from './inputs/play-card.input';
import { CancelPlayCardInput } from './inputs/cancel-play-card.input';
import { SelectSpaceOnBoardInput } from './inputs/select-space-on-board.input';
import { MoveInput } from './inputs/move.input';
import { MulliganInput } from './inputs/mulligan.input';
import { PassInput } from './inputs/pass.input';
import { AttackInput } from './inputs/attack.input';
import { SurrenderInput } from './inputs/surrender.input';
import { UseAbilityInput } from './inputs/use-ability.input';

type GenericInputMap = Record<string, Constructor<Input<ZodType>>>;

type ValidatedInputMap<T extends GenericInputMap> = {
  [Name in keyof T & string]: T[Name] extends Constructor<Input<ZodType>>
    ? Name extends InstanceType<T[Name]>['name']
      ? T[Name]
      : `input map mismatch: expected ${Name}, but Input name is ${InstanceType<T[Name]>['name']}`
    : `input type mismatch: expected Input constructor`;
};

const validateinputMap = <T extends GenericInputMap>(data: ValidatedInputMap<T>) => data;

const inputMap = validateinputMap({
  playCard: PlayCardInput,
  cancelPlayCard: CancelPlayCardInput,
  selectSpaceOnBoard: SelectSpaceOnBoardInput,
  commitSpaceSelection: CommitSpaceSelectionInput,
  chooseCards: ChooseCardsInput,
  move: MoveInput,
  mulligan: MulliganInput,
  pass: PassInput,
  attack: AttackInput,
  surrender: SurrenderInput,
  useAbility: UseAbilityInput
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

export class InputSystem extends System<never> {
  private history: Input<any>[] = [];

  private isRunning = false;

  private queue: AnyFunction[] = [];

  private _currentAction?: Nullable<InstanceType<Values<typeof inputMap>>> = null;

  private onUnpause: UnpauseCallback<any> | null = null;

  private nextInputId = 0;

  get currentAction() {
    return this._currentAction;
  }

  get isPaused() {
    return isDefined(this.onUnpause);
  }

  initialize() {}

  async applyHistory(rawHistory: SerializedInput[]) {
    this.isRunning = false;
    this._currentAction = null;
    for (const rawInput of rawHistory) {
      void this.dispatch(rawInput);
      // dispatch is async but it doesnt actually return when the input is fully processed
      // so we need to wait a bit before dispatching the next input
      await waitFor(20);
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
        await fn!();
      }
      this.isRunning = false;
      await this.game.snapshotSystem.takeSnapshot();
      await this.game.emit(GAME_EVENTS.FLUSHED, new GameInputQueueFlushedEvent({}));
    } catch (err) {
      await this.handleError(err);
    }
  }

  private async handleError(err: unknown) {
    console.groupCollapsed('%c[INPUT SYSTEM]: ERROR', 'color: #ff0000');
    console.error(err);
    console.log({
      initialState: this.game.options,
      history: this.game.inputSystem.serialize()
    });
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
      await this.game.snapshotSystem.takeSnapshot();
    } else {
      await this.game.snapshotSystem.takeErrorSnapshot();
    }
    await this.game.emit(GAME_EVENTS.FLUSHED, new GameInputQueueFlushedEvent({}));
  }

  async dispatch(input: SerializedInput) {
    console.groupCollapsed(`[InputSystem]: ${input.type}`);
    console.log(input);
    console.groupEnd();
    if (!this.isActionType(input.type)) return;
    if (this.isPaused) {
      // if the game is paused, run the input immediately
      try {
        await this.handleInput(input);
      } catch (err) {
        await this.handleError(err);
      }
    } else if (this.isRunning) {
      // let the current input fully resolve, then schedule
      // the current input could schedule new actions, so we need to wait for the flush to preserve the correct action order
      this.game.once(GAME_EVENTS.FLUSHED, () => {
        return this.schedule(() => this.handleInput(input));
      });
    } else {
      // if the game is not paused and not running, schedule the input
      await this.schedule(() => {
        return this.handleInput(input);
      });
    }
  }

  async handleInput(arg: SerializedInput) {
    const { type, payload } = arg;
    if (!this.isActionType(type)) return;
    const ctor = inputMap[type];
    const input = new ctor(this.game, this.nextInputId++, payload);
    const prevAction = this._currentAction;
    this._currentAction = input;
    await this.game.emit(GAME_EVENTS.INPUT_START, new GameInputEvent({ input }));

    this.addToHistory(input);
    await input.execute();
    await this.game.emit(GAME_EVENTS.INPUT_END, new GameInputEvent({ input }));
    this._currentAction = prevAction;
  }

  getHistory() {
    return [...this.history];
  }

  async askForPlayerInput() {
    await this.game.snapshotSystem.takeSnapshot();
    // await this.game.emit(GAME_EVENTS.INPUT_REQUIRED, new GameInputRequiredEvent({}));
  }

  serialize() {
    return this.history.map(action => action.serialize()) as SerializedInput[];
  }
}
