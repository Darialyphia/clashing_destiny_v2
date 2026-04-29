import type { BoardCell } from '../../board/entities/board-cell.entity';
import type { SerializedUnit, Unit } from '../../unit/unit.entity';
import { TypedSerializableEvent } from '../../utils/typed-emitter';
import type { MinionCard, SerializedMinionCard } from '../entities/minion-card.entity';
import type { Point, Values } from '@game/shared';

export const MINION_EVENTS = {
  MINION_BEFORE_SUMMON: 'minion:before-summon',
  MINION_AFTER_SUMMON: 'minion:after-summon'
} as const;
export type MinionEvent = Values<typeof MINION_EVENTS>;

export class MinionBeforeSummonedEvent extends TypedSerializableEvent<
  { card: MinionCard; cell: BoardCell },
  { card: SerializedMinionCard; position: Point }
> {
  serialize() {
    return {
      card: this.data.card.serialize(),
      position: this.data.cell.position.serialize()
    };
  }
}

export class MinionAfterSummonedEvent extends TypedSerializableEvent<
  { card: MinionCard; unit: Unit },
  {
    card: SerializedMinionCard;
    unit: SerializedUnit;
  }
> {
  serialize() {
    return {
      card: this.data.card.serialize(),
      unit: this.data.unit.serialize()
    };
  }
}

export type MinionEventMap = {
  [MINION_EVENTS.MINION_BEFORE_SUMMON]: MinionBeforeSummonedEvent;
  [MINION_EVENTS.MINION_AFTER_SUMMON]: MinionAfterSummonedEvent;
};
