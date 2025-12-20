import type { BoardSlotZone } from '../board/board.constants';
import type { AttackTarget } from '../game/phases/combat.phase';
import type { CombatDamage } from '../utils/damage';
import { TypedSerializableEvent } from '../utils/typed-emitter';
import type { CARD_EVENTS } from './card.enums';
import type { CardLocation } from './components/card-manager.component';
import type { AnyCard, SerializedCard } from './entities/card.entity';
import type { HeroCard } from './entities/hero.entity';
import type { MinionCard } from './entities/minion.entity';
import type { SigilCard } from './entities/sigil.entity';

export class CardExhaustEvent extends TypedSerializableEvent<
  { card: AnyCard },
  { card: SerializedCard }
> {
  serialize() {
    return {
      card: this.data.card.serialize()
    };
  }
}

export class CardWakeUpEvent extends TypedSerializableEvent<
  { card: AnyCard },
  { card: SerializedCard }
> {
  serialize() {
    return {
      card: this.data.card.serialize()
    };
  }
}

export class CardDiscardEvent extends TypedSerializableEvent<
  { card: AnyCard },
  { card: SerializedCard }
> {
  serialize() {
    return {
      card: this.data.card.serialize()
    };
  }
}

export class CardAddToHandevent extends TypedSerializableEvent<
  { card: AnyCard; index: number | null },
  { card: SerializedCard; index: number | null }
> {
  serialize() {
    return {
      card: this.data.card.serialize(),
      index: this.data.index
    };
  }
}

export class CardBeforePlayEvent extends TypedSerializableEvent<
  { card: AnyCard },
  { card: SerializedCard }
> {
  serialize() {
    return {
      card: this.data.card.serialize()
    };
  }
}

export class CardAfterPlayEvent extends TypedSerializableEvent<
  { card: AnyCard },
  { card: SerializedCard }
> {
  serialize() {
    return {
      card: this.data.card.serialize()
    };
  }
}

export class CardBeforeDestroyEvent extends TypedSerializableEvent<
  { card: AnyCard },
  { card: SerializedCard }
> {
  serialize() {
    return {
      card: this.data.card.serialize()
    };
  }
}

export class CardAfterDestroyEvent extends TypedSerializableEvent<
  { card: AnyCard },
  { card: SerializedCard }
> {
  serialize() {
    return {
      card: this.data.card.serialize()
    };
  }
}

export class CardLeaveBoardEvent extends TypedSerializableEvent<
  { card: AnyCard },
  { card: SerializedCard }
> {
  serialize() {
    return {
      card: this.data.card.serialize()
    };
  }
}

export class CardDeclarePlayEvent extends TypedSerializableEvent<
  { card: AnyCard },
  { card: SerializedCard }
> {
  serialize() {
    return {
      card: this.data.card.serialize() as SerializedCard
    };
  }
}

export class CardDeclareUseAbilityEvent extends TypedSerializableEvent<
  { card: AnyCard; abilityId: string },
  { card: SerializedCard; abilityId: string }
> {
  serialize() {
    return {
      card: this.data.card.serialize() as SerializedCard,
      abilityId: this.data.abilityId
    };
  }
}

export class CardDisposedEvent extends TypedSerializableEvent<
  { card: AnyCard },
  { card: string }
> {
  serialize() {
    return {
      card: this.data.card.serialize()
    };
  }
}

export class CardEffectTriggeredEvent extends TypedSerializableEvent<
  { card: AnyCard; message: string },
  { card: string; message: string }
> {
  serialize() {
    return {
      card: this.data.card.id,
      message: this.data.message
    };
  }
}

export class CardBeforeDealCombatDamageEvent extends TypedSerializableEvent<
  {
    card: MinionCard | HeroCard;
    target: AttackTarget;
    affectedCards: Array<MinionCard | HeroCard>;
    damage: CombatDamage;
  },
  { card: string; target: string; damage: number; affectedCards: string[] }
> {
  serialize() {
    return {
      card: this.data.card.id,
      target: this.data.target.id,
      damage: this.data.damage.getFinalAmount(this.data.target),
      affectedCards: this.data.affectedCards.map(card => card.id)
    };
  }
}

export class CardAfterDealCombatDamageEvent extends TypedSerializableEvent<
  {
    card: MinionCard | HeroCard;
    target: AttackTarget;
    damage: CombatDamage;
    affectedCards: Array<MinionCard | HeroCard>;
  },
  {
    card: string;
    target: string;
    damage: number;
    affectedCards: string[];
    isFatal: boolean;
  }
> {
  serialize() {
    return {
      card: this.data.card.id,
      target: this.data.target.id,
      damage: this.data.damage.getFinalAmount(this.data.target),
      affectedCards: this.data.affectedCards.map(card => card.id),
      isFatal: !this.data.target.isAlive
    };
  }
}

export class CardChangeZoneEvent extends TypedSerializableEvent<
  { card: MinionCard | SigilCard; from: BoardSlotZone; to: BoardSlotZone },
  {
    card: string;
    from: BoardSlotZone;
    to: BoardSlotZone;
  }
> {
  serialize() {
    return {
      card: this.data.card.id,
      from: this.data.from,
      to: this.data.to
    };
  }
}

export class CardChangeLocationEvent extends TypedSerializableEvent<
  { card: AnyCard; from: CardLocation | null; to: CardLocation },
  { card: string; from: CardLocation | null; to: CardLocation }
> {
  serialize() {
    return {
      card: this.data.card.id,
      from: this.data.from,
      to: this.data.to
    };
  }
}

export type CardEventMap = {
  [CARD_EVENTS.CARD_EXHAUST]: CardExhaustEvent;
  [CARD_EVENTS.CARD_WAKE_UP]: CardWakeUpEvent;
  [CARD_EVENTS.CARD_DISCARD]: CardDiscardEvent;
  [CARD_EVENTS.CARD_ADD_TO_HAND]: CardAddToHandevent;
  [CARD_EVENTS.CARD_LEAVE_BOARD]: CardLeaveBoardEvent;
  [CARD_EVENTS.CARD_BEFORE_PLAY]: CardBeforePlayEvent;
  [CARD_EVENTS.CARD_AFTER_PLAY]: CardAfterPlayEvent;
  [CARD_EVENTS.CARD_BEFORE_DESTROY]: CardBeforeDestroyEvent;
  [CARD_EVENTS.CARD_AFTER_DESTROY]: CardAfterDestroyEvent;
  [CARD_EVENTS.CARD_DECLARE_PLAY]: CardDeclarePlayEvent;
  [CARD_EVENTS.CARD_DECLARE_USE_ABILITY]: CardDeclareUseAbilityEvent;
  [CARD_EVENTS.CARD_DISPOSED]: CardDisposedEvent;
  [CARD_EVENTS.CARD_EFFECT_TRIGGERED]: CardEffectTriggeredEvent;
  [CARD_EVENTS.CARD_BEFORE_DEAL_COMBAT_DAMAGE]: CardBeforeDealCombatDamageEvent;
  [CARD_EVENTS.CARD_AFTER_DEAL_COMBAT_DAMAGE]: CardAfterDealCombatDamageEvent;
  [CARD_EVENTS.CARd_BEFORE_CHANGE_ZONE]: CardChangeZoneEvent;
  [CARD_EVENTS.CARD_AFTER_CHANGE_ZONE]: CardChangeZoneEvent;
  [CARD_EVENTS.CARD_BEFORE_CHANGE_LOCATION]: CardChangeLocationEvent;
  [CARD_EVENTS.CARD_AFTER_CHANGE_LOCATION]: CardChangeLocationEvent;
};
