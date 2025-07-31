import { assert, isDefined, type Serializable } from '@game/shared';
import type { MinionCard } from '../card/entities/minion.card';
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
    private player: Player,
    private zone: 'attack' | 'defense',
    private position: number
  ) {
    super(`minion-slot-${player.id}-${zone}-${position}`, {
      canSummon: new Interceptable()
    });
  }

  serialize() {
    return {
      playerId: this.player.id,
      zone: this.zone,
      position: this.position,
      minion: this._minion?.id ?? null,
      canSummon: this.canSummon
    };
  }

  isSame(position: MinionPosition): boolean {
    return (
      this.zone === position.zone &&
      this.position === position.slot &&
      this.player.equals(position.player)
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
    return this.player.boardSide.getSlot(this.zone, this.position - 1);
  }

  get right(): BoardMinionSlot | null {
    return this.player.boardSide.getSlot(this.zone, this.position + 1);
  }

  get inFront(): BoardMinionSlot | null {
    return this.zone === 'attack'
      ? this.player.opponent.boardSide.getSlot('attack', this.position)
      : this.player.boardSide.getSlot('attack', this.position);
  }

  get behind(): BoardMinionSlot | null {
    return this.zone === 'attack'
      ? this.player.boardSide.getSlot('defense', this.position)
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
