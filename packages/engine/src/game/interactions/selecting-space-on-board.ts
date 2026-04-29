import { assert, isDefined, type MaybePromise } from '@game/shared';
import { IllegalTargetError } from '../../input/input-errors';
import type { Player } from '../../player/player.entity';
import type { Game } from '../game';
import { INTERACTION_STATE_TRANSITIONS } from '../game.enums';
import { InvalidPlayerError, UnableToCommitError } from '../game-error';
import type { AnyCard } from '../../card/entities/card.entity';
import type { BoardRow, BoardSpace } from '../../board/board-space.entity';

export type SelectingSpaceOnBoardContextOptions = {
  player: Player;
  source: AnyCard;
  getLabel: (selectedSpaces: BoardSpace<AnyCard>[]) => string;
  isElligible: (
    space: BoardSpace<AnyCard>,
    selectedSpaces: BoardSpace<AnyCard>[]
  ) => boolean;
  canCommit: (selectedSpaces: BoardSpace<AnyCard>[]) => boolean;
  isDone(selectedSpaces: BoardSpace<AnyCard>[]): boolean;
  timeoutFallback: BoardSpace<AnyCard>[];
  canCancel: boolean;
  onCancel?: (player: Player) => MaybePromise<void>;
};

export class SelectingSpaceOnBoardContext {
  static async create(game: Game, options: SelectingSpaceOnBoardContextOptions) {
    const instance = new SelectingSpaceOnBoardContext(game, options);
    await instance.init();
    return instance;
  }
  private selectedSpaces: BoardSpace<AnyCard>[] = [];

  private isElligible: (
    space: BoardSpace<AnyCard>,
    selectedSpaces: BoardSpace<AnyCard>[]
  ) => boolean;

  private _canCommit: (selectedSpaces: BoardSpace<AnyCard>[]) => boolean;

  private isDone: (selectedSpaces: BoardSpace<AnyCard>[]) => boolean;

  readonly player: Player;

  private timeoutFallback: BoardSpace<AnyCard>[];

  private constructor(
    private game: Game,
    private options: SelectingSpaceOnBoardContextOptions
  ) {
    this.player = options.player;
    this.isElligible = options.isElligible;
    this._canCommit = options.canCommit;
    this.isDone = options.isDone;
    this.timeoutFallback = options.timeoutFallback;
  }

  serialize() {
    return {
      player: this.player.id,
      source: this.options.source.id,
      label: this.options.getLabel(this.selectedSpaces),
      selectedSpaces: this.selectedSpaces.map(space => space.serialize()),
      elligibleSpaces: this.elligibleSpaces.map(space => space.serialize()),
      canCommit: this.canCommit(this.selectedSpaces),
      canCancel: this.options.canCancel
    };
  }

  private canCommit(selectedSpaces: BoardSpace<AnyCard>[]) {
    if (this.elligibleSpaces.length === 0) return true;

    return this._canCommit(selectedSpaces);
  }

  async init() {}

  get elligibleSpaces() {
    return this.game.boardSystem.sides
      .flatMap(side => side.allSpaces)
      .filter(space => this.isElligible(space, this.selectedSpaces));
  }

  private async autoCommitIfAble() {
    const isDone = this.isDone(this.selectedSpaces);
    const canCommit = this.canCommit(this.selectedSpaces);
    if (isDone && canCommit) {
      await this.commit(this.player);
    } else {
      await this.game.inputSystem.askForPlayerInput();
    }
  }

  async selectSpace(
    player: Player,
    space: {
      playerId: string;
      zone: BoardRow;
      index: number;
    }
  ) {
    assert(player.equals(this.player), new InvalidPlayerError());
    const cell = this.game.boardSystem.getBoardSpace(space);
    assert(isDefined(cell), new IllegalTargetError());
    assert(this.isElligible(cell, this.selectedSpaces), new IllegalTargetError());
    this.selectedSpaces.push(cell);
    await this.autoCommitIfAble();
  }

  async commit(player: Player, isTimeout = false) {
    if (isTimeout) {
      this.selectedSpaces = [...this.timeoutFallback];
    } else {
      assert(this.canCommit, new UnableToCommitError());
    }
    assert(player.equals(this.player), new InvalidPlayerError());
    await this.game.interaction.sendTransition(
      INTERACTION_STATE_TRANSITIONS.COMMIT_SELECTING_SPACE_ON_BOARD,
      {}
    );
    this.game.inputSystem.unpause(this.selectedSpaces);
  }

  async cancel(player: Player) {
    assert(player.equals(this.player), new InvalidPlayerError());
    assert(this.options.canCancel, new UnableToCommitError());
    await this.game.interaction.sendTransition(
      INTERACTION_STATE_TRANSITIONS.CANCEL_SELECTING_SPACE_ON_BOARD,
      {}
    );
    await this.options.onCancel?.(player);
    this.game.inputSystem.unpause([]);
  }
}
