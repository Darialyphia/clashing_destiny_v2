import type { Values } from '@game/shared';
import type { MinionCard, SerializedMinionCard } from '../entities/minion.entity';
import { TypedSerializableEvent } from '../../utils/typed-emitter';
import type { BoardSlot, SerializedBoardSlot } from '../../board/board-slot.entity';

export const MINION_EVENTS = {
  MINION_SUMMONED: 'minion.summoned',
  MINION_BEFORE_HEAL: 'minion.before-heal',
  MINION_AFTER_HEAL: 'minion.after-heal',
  MINION_BEFORE_USE_ABILITY: 'minion.before-use-ability',
  MINION_AFTER_USE_ABILITY: 'minion.after-use-ability',
  MINION_BEFORE_MOVE: 'minion.before-move',
  MINION_AFTER_MOVE: 'minion.after-move'
} as const;
export type MinionEvents = Values<typeof MINION_EVENTS>;

export class MinionCardHealEvent extends TypedSerializableEvent<
  { card: MinionCard; amount: number },
  { card: SerializedMinionCard; amount: number }
> {
  serialize() {
    return {
      card: this.data.card.serialize(),
      amount: this.data.amount
    };
  }
}

export class MinionUsedAbilityEvent extends TypedSerializableEvent<
  { card: MinionCard; abilityId: string },
  { card: SerializedMinionCard; abilityId: string }
> {
  serialize() {
    return {
      card: this.data.card.serialize(),
      abilityId: this.data.abilityId
    };
  }
}

export class MinionSummonedEvent extends TypedSerializableEvent<
  { card: MinionCard },
  { card: SerializedMinionCard }
> {
  serialize() {
    return {
      card: this.data.card.serialize()
    };
  }
}

export class MinionMoveEvent extends TypedSerializableEvent<
  { card: MinionCard; from: BoardSlot; to: BoardSlot },
  {
    card: SerializedMinionCard;
    from: SerializedBoardSlot;
    to: SerializedBoardSlot;
  }
> {
  serialize() {
    return {
      card: this.data.card.serialize(),
      from: this.data.from.serialize(),
      to: this.data.to.serialize()
    };
  }
}
export type MinionCardEventMap = {
  [MINION_EVENTS.MINION_BEFORE_USE_ABILITY]: MinionUsedAbilityEvent;
  [MINION_EVENTS.MINION_AFTER_USE_ABILITY]: MinionUsedAbilityEvent;
  [MINION_EVENTS.MINION_SUMMONED]: MinionSummonedEvent;
  [MINION_EVENTS.MINION_BEFORE_HEAL]: MinionCardHealEvent;
  [MINION_EVENTS.MINION_AFTER_HEAL]: MinionCardHealEvent;
  [MINION_EVENTS.MINION_BEFORE_MOVE]: MinionMoveEvent;
  [MINION_EVENTS.MINION_AFTER_MOVE]: MinionMoveEvent;
};
