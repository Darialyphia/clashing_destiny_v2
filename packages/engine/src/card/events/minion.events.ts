import type { Values } from '@game/shared';
import type { BoardSlotZone } from '../../board/board.constants';
import type { AnyCard } from '../entities/card.entity';
import type { MinionCard, SerializedMinionCard } from '../entities/minion.entity';
import type { Damage, DamageType } from '../../utils/damage';
import { TypedSerializableEvent } from '../../utils/typed-emitter';

export const MINION_EVENTS = {
  MINION_SUMMONED: 'minion.summoned',
  MINION_BEFORE_TAKE_DAMAGE: 'minion.before-take-damage',
  MINION_AFTER_TAKE_DAMAGE: 'minion.after-take-damage',
  MINION_BEFORE_HEAL: 'minion.before-heal',
  MINION_AFTER_HEAL: 'minion.after-heal',
  MINION_BEFORE_USE_ABILITY: 'minion.before-use-ability',
  MINION_AFTER_USE_ABILITY: 'minion.after-use-ability'
} as const;
export type MinionEvents = Values<typeof MINION_EVENTS>;

export class MinionCardBeforeTakeDamageEvent extends TypedSerializableEvent<
  { card: MinionCard; source: AnyCard; damage: Damage; amount: number },
  {
    card: string;
    source: string;
    damage: { type: DamageType; amount: number };
    amount: number;
  }
> {
  serialize() {
    return {
      card: this.data.card.id,
      source: this.data.source.id,
      damage: {
        type: this.data.damage.type,
        amount: this.data.damage.getFinalAmount(this.data.card)
      },
      amount: this.data.amount
    };
  }
}

export class MinionCardAfterTakeDamageEvent extends TypedSerializableEvent<
  { card: MinionCard; source: AnyCard; damage: Damage; isFatal: boolean; amount: number },
  {
    card: SerializedMinionCard;
    source: string;
    damage: { type: DamageType; amount: number };
    isFatal: boolean;
    amount: number;
  }
> {
  serialize() {
    return {
      card: this.data.card.serialize(),
      source: this.data.source.id,
      damage: {
        type: this.data.damage.type,
        amount: this.data.damage.getFinalAmount(this.data.card)
      },
      isFatal: this.data.isFatal,
      amount: this.data.amount
    };
  }
}

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
  { card: MinionCard; zone: BoardSlotZone },
  { card: SerializedMinionCard; zone: BoardSlotZone }
> {
  serialize() {
    return {
      card: this.data.card.serialize(),
      zone: this.data.zone
    };
  }
}

export type MinionCardEventMap = {
  [MINION_EVENTS.MINION_BEFORE_TAKE_DAMAGE]: MinionCardBeforeTakeDamageEvent;
  [MINION_EVENTS.MINION_AFTER_TAKE_DAMAGE]: MinionCardAfterTakeDamageEvent;
  [MINION_EVENTS.MINION_BEFORE_USE_ABILITY]: MinionUsedAbilityEvent;
  [MINION_EVENTS.MINION_AFTER_USE_ABILITY]: MinionUsedAbilityEvent;
  [MINION_EVENTS.MINION_SUMMONED]: MinionSummonedEvent;
  [MINION_EVENTS.MINION_BEFORE_HEAL]: MinionCardHealEvent;
  [MINION_EVENTS.MINION_AFTER_HEAL]: MinionCardHealEvent;
};
