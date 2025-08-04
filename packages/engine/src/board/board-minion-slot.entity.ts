import { assert, isDefined, type Serializable } from '@game/shared';
import type { MinionCard } from '../card/entities/minion.entity';
import { EntityWithModifiers } from '../entity';
import type { Player } from '../player/player.entity';
import { Interceptable } from '../utils/interceptable';
import type { MinionPosition } from '../game/interactions/selecting-minion-slots.interaction';

type BoardMinionSlotInterceptors = {
  canSummon: Interceptable<boolean>;
};

export type SerializedBoardMinionSlot = {
  playerId: string;
  zone: 'attack' | 'defense';
  position: number;
  minion: string | null;
  canSummon: boolean;
};

export class BoardMinionSlot
  extends EntityWithModifiers<BoardMinionSlotInterceptors>
  implements Serializable<SerializedBoardMinionSlot>
{
  private _minion: MinionCard | null = null;

  constructor(
    private _player: Player,
    private _zone: 'attack' | 'defense',
    private _position: number
  ) {
    super(`minion-slot-${_player.id}-${_zone}-${_position}`, {
      canSummon: new Interceptable()
    });
  }

  get player(): Player {
    return this._player;
  }

  get zone(): 'attack' | 'defense' {
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
      minion: this._minion?.id ?? null,
      canSummon: this.canSummon
    };
  }

  isSame(position: MinionPosition): boolean {
    return (
      this._zone === position.zone &&
      this._position === position.slot &&
      this._player.equals(position.player)
    );
  }

  get minion(): MinionCard | null {
    return this._minion;
  }

  get isOccupied(): boolean {
    return this._minion !== null;
  }

  get canSummon() {
    return this.interceptors.canSummon.getValue(!this.isOccupied, {});
  }

  summon(minion: MinionCard): void {
    assert(!this.isOccupied, 'Minion slot already occupied');
    this._minion = minion;
  }

  removeMinion() {
    assert(this.isOccupied, 'Minion slot already empty');
    const minion = this._minion!;
    this._minion = null;

    return minion;
  }

  get left(): BoardMinionSlot | null {
    return this._player.boardSide.getSlot(this._zone, this._position - 1);
  }

  get right(): BoardMinionSlot | null {
    return this._player.boardSide.getSlot(this._zone, this._position + 1);
  }

  get inFront(): BoardMinionSlot | null {
    return this._zone === 'attack'
      ? this._player.opponent.boardSide.getSlot('attack', this._position)
      : this._player.boardSide.getSlot('attack', this._position);
  }

  get behind(): BoardMinionSlot | null {
    return this._zone === 'attack'
      ? this._player.boardSide.getSlot('defense', this._position)
      : null;
  }

  get adjacentSlots(): BoardMinionSlot[] {
    return [this.left, this.right, this.inFront, this.behind].filter(
      isDefined
    ) as BoardMinionSlot[];
  }

  get adjacentMinions() {
    return this.adjacentSlots.map(slot => slot.minion).filter(isDefined);
  }
}
