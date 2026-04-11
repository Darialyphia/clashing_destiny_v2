import { assert, isDefined, type Serializable } from '@game/shared';
import type { MinionCard } from '../card/entities/minion.entity';
import type { Player } from '../player/player.entity';
import { Interceptable } from '../utils/interceptable';
import { BOARD_SLOT_ROWS, type BoardSlotRow } from './board.constants';
import { EntityWithModifiers } from '../modifier/entity-with-modifiers';
import type { Game } from '..';
import type { BoardPosition } from '../game/interactions/selecting-minion-slots.interaction';
import { isMinion } from '../card/card-utils';

type BoardSlotInterceptors = {
  canSummon: Interceptable<boolean>;
};

export type SerializedBoardSlot = {
  playerId: string;
  row: BoardSlotRow;
  position: number;
  minion: string | null;
  canSummon: boolean;
};

export class BoardSlot
  extends EntityWithModifiers<BoardSlotInterceptors>
  implements Serializable<SerializedBoardSlot>
{
  private _occupant: MinionCard | null = null;

  constructor(
    game: Game,
    private _player: Player,
    private _row: BoardSlotRow,
    private _position: number
  ) {
    super(`minion-slot-${_player.id}-${_row}-${_position}`, game, {
      canSummon: new Interceptable()
    });
  }

  get player(): Player {
    return this._player;
  }

  get row(): BoardSlotRow {
    return this._row;
  }

  get position(): number {
    return this._position;
  }

  // this is here for compatibility reason with some legacy code
  get slot(): number {
    return this._position;
  }

  serialize() {
    return {
      playerId: this._player.id,
      row: this._row,
      position: this._position,
      minion: this._occupant?.id ?? null,
      canSummon: this.canSummon
    };
  }

  isSame(position: BoardPosition): boolean {
    return (
      this._row === position.row &&
      this._position === position.slot &&
      this._player.equals(position.player)
    );
  }

  get minion(): MinionCard | null {
    if (!this._occupant) return null;
    if (isMinion(this._occupant)) {
      return this._occupant;
    }
    return null;
  }

  get isOccupied(): boolean {
    return this._occupant !== null;
  }

  get canSummon() {
    return this.interceptors.canSummon.getValue(!this.isOccupied, {});
  }

  summonMinion(minion: MinionCard): void {
    assert(!this.isOccupied, 'Board slot already occupied');
    this._occupant = minion;
  }

  removeMinion() {
    assert(this.isOccupied, 'Minion slot already empty');
    assert(isMinion(this._occupant!), 'Only minions can be removed with removeMinion');
    const minion = this._occupant!;
    this._occupant = null;

    return minion;
  }

  get left(): BoardSlot | null {
    return this._player.boardSide.getSlot(this._row, this._position - 1);
  }

  get right(): BoardSlot | null {
    return this._player.boardSide.getSlot(this._row, this._position + 1);
  }

  get inFront(): BoardSlot | null {
    return this._row === BOARD_SLOT_ROWS.FRONT_ROW
      ? this._player.opponent.boardSide.getSlot(BOARD_SLOT_ROWS.FRONT_ROW, this._position)
      : this._player.boardSide.getSlot(BOARD_SLOT_ROWS.FRONT_ROW, this._position);
  }

  get behind(): BoardSlot | null {
    return this._row === BOARD_SLOT_ROWS.FRONT_ROW
      ? this._player.boardSide.getSlot(BOARD_SLOT_ROWS.BACK_ROW, this._position)
      : null;
  }

  get adjacentSlots(): BoardSlot[] {
    return [this.left, this.right, this.inFront, this.behind].filter(
      isDefined
    ) as BoardSlot[];
  }

  get adjacentMinions() {
    return this.adjacentSlots.map(slot => slot.minion).filter(isDefined);
  }
}
