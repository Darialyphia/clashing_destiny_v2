import { assert, isDefined, type Serializable } from '@game/shared';
import type { MinionCard } from '../card/entities/minion.entity';
import { EntityWithModifiers } from '../entity';
import type { Player } from '../player/player.entity';
import { Interceptable } from '../utils/interceptable';
import type { BoardPosition } from '../game/interactions/selecting-minion-slots.interaction';
import { BOARD_SLOT_ZONES, type BoardSlotZone } from './board.constants';
import type { SigilCard } from '../card/entities/sigil.entity';
import { isMinion, isSigil } from '../card/card-utils';

type BoardSlotInterceptors = {
  canSummon: Interceptable<boolean>;
};

export type SerializedBoardSlot = {
  playerId: string;
  zone: BoardSlotZone;
  position: number;
  minion: string | null;
  canSummon: boolean;
};

export class BoardSlot
  extends EntityWithModifiers<BoardSlotInterceptors>
  implements Serializable<SerializedBoardSlot>
{
  private _occupant: MinionCard | SigilCard | null = null;

  constructor(
    private _player: Player,
    private _zone: BoardSlotZone,
    private _position: number
  ) {
    super(`minion-slot-${_player.id}-${_zone}-${_position}`, {
      canSummon: new Interceptable()
    });
  }

  get player(): Player {
    return this._player;
  }

  get zone(): BoardSlotZone {
    return this._zone;
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
      zone: this._zone,
      position: this._position,
      minion: this._occupant?.id ?? null,
      canSummon: this.canSummon
    };
  }

  isSame(position: BoardPosition): boolean {
    return (
      this._zone === position.zone &&
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

  get sigil(): SigilCard | null {
    if (!this._occupant) return null;
    if (isSigil(this._occupant)) {
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

  summonSigil(sigil: SigilCard): void {
    assert(!this.isOccupied, 'Board slot already occupied');
    this._occupant = sigil;
  }

  removeSigil() {
    assert(this.isOccupied, 'Minion slot already empty');
    assert(isSigil(this._occupant!), 'Only sigils can be removed with removeSigil');
    const sigil = this._occupant!;
    this._occupant = null;

    return sigil;
  }

  get left(): BoardSlot | null {
    return this._player.boardSide.getSlot(this._zone, this._position - 1);
  }

  get right(): BoardSlot | null {
    return this._player.boardSide.getSlot(this._zone, this._position + 1);
  }

  get inFront(): BoardSlot | null {
    return this._zone === BOARD_SLOT_ZONES.FRONT_ROW
      ? this._player.opponent.boardSide.getSlot(
          BOARD_SLOT_ZONES.FRONT_ROW,
          this._position
        )
      : this._player.boardSide.getSlot(BOARD_SLOT_ZONES.FRONT_ROW, this._position);
  }

  get behind(): BoardSlot | null {
    return this._zone === BOARD_SLOT_ZONES.FRONT_ROW
      ? this._player.boardSide.getSlot(BOARD_SLOT_ZONES.BACK_ROW, this._position)
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

  get adjacentSigils() {
    return this.adjacentSlots.map(slot => slot.sigil).filter(isDefined);
  }
}
