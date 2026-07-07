import { assert, isDefined } from '@game/shared';
import { IllegalTargetError } from '../../input/input-errors';
import type { Player } from '../../player/player.entity';
import type { Game } from '../game';
import { INTERACTION_STATE_TRANSITIONS } from '../game.enums';
import { InvalidPlayerError, UnableToCommitError } from '../game-error';
import type { AnyCard } from '../../card/entities/card.entity';
import type { BoardSpace } from '../../board/board-space.entity';
import type { AOEShape } from '../../aoe/aoe-shape';

export type SelectingSpaceOnBoardContextOptions<T extends boolean = boolean> = {
  player: Player;
  source: AnyCard;
  getLabel: (selectedSpaces: BoardSpace[]) => string;
  isElligible: (space: BoardSpace, selectedSpaces: BoardSpace[]) => boolean;
  canCommit: (selectedSpaces: BoardSpace[]) => boolean;
  isDone(selectedSpaces: BoardSpace[]): boolean;
  timeoutFallback: BoardSpace[];
  canCancel: T;
  getAOE: (ctx: SelectingSpaceOnBoardContext) => AOEShape | null;
};

export class SelectingSpaceOnBoardContext {
  static async create<T extends boolean = boolean>(
    game: Game,
    options: SelectingSpaceOnBoardContextOptions<T>
  ) {
    const instance = new SelectingSpaceOnBoardContext(game, options);
    await instance.init();
    return instance;
  }
  private selectedSpaces: BoardSpace[] = [];

  private isElligible: (space: BoardSpace, selectedSpaces: BoardSpace[]) => boolean;

  private _canCommit: (selectedSpaces: BoardSpace[]) => boolean;

  private isDone: (selectedSpaces: BoardSpace[]) => boolean;

  readonly player: Player;

  private timeoutFallback: BoardSpace[];

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

  get AOEForNextSpace() {
    return Object.fromEntries(
      this.elligibleSpaces.map(space => {
        const spaces = [...this.selectedSpaces, space];
        const aoe = this.options.getAOE(this);
        if (!aoe) return [space.id, []];
        const area = aoe?.getArea(spaces.map(space => space.position));
        return [space.id, area.map(space => space.id)];
      })
    );
  }

  serialize() {
    return {
      player: this.player.id,
      source: this.options.source.id,
      label: this.options.getLabel(this.selectedSpaces),
      selectedSpaces: this.selectedSpaces.map(space => space.serialize()),
      elligibleSpaces: this.elligibleSpaces.map(space => space.serialize()),
      canCommit: this.canCommit(this.selectedSpaces),
      canCancel: this.options.canCancel,
      AOEForNextSpace: this.AOEForNextSpace
    };
  }

  private canCommit(selectedSpaces: BoardSpace[]) {
    if (this.elligibleSpaces.length === 0) return true;

    return this._canCommit(selectedSpaces);
  }

  async init() {}

  get elligibleSpaces() {
    return this.game.boardSystem.boardSpaces.filter(space =>
      this.isElligible(space, this.selectedSpaces)
    );
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

  async selectSpace(player: Player, id: string) {
    assert(player.equals(this.player), new InvalidPlayerError());
    const space = this.game.boardSystem.getBoardSpaceById(id);
    assert(isDefined(space), new IllegalTargetError());
    assert(this.isElligible(space, this.selectedSpaces), new IllegalTargetError());
    this.selectedSpaces.push(space);
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
    this.game.inputSystem.unpause({ cancelled: false, result: this.selectedSpaces });
  }

  async cancel(player: Player) {
    assert(player.equals(this.player), new InvalidPlayerError());
    assert(this.options.canCancel, new UnableToCommitError());
    await this.game.interaction.sendTransition(
      INTERACTION_STATE_TRANSITIONS.CANCEL_SELECTING_SPACE_ON_BOARD,
      {}
    );
    this.game.inputSystem.unpause({ cancelled: true, result: null });
  }
}
