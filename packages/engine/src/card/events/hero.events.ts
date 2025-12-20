import type { Values } from '@game/shared';
import type { AnyCard } from '../entities/card.entity';
import type { HeroCard, SerializedHeroCard } from '../entities/hero.entity';
import type { Damage, DamageType } from '../../utils/damage';
import { TypedSerializableEvent } from '../../utils/typed-emitter';

export const HERO_EVENTS = {
  HERO_BEFORE_TAKE_DAMAGE: 'hero.before-take-damage',
  HERO_AFTER_TAKE_DAMAGE: 'hero.after-take-damage',
  HERO_BEFORE_HEAL: 'hero.before-heal',
  HERO_AFTER_HEAL: 'hero.after-heal',
  HERO_BEFORE_LEVEL_UP: 'hero.before-level-up',
  HERO_AFTER_LEVEL_UP: 'hero.after-level-up',
  HERO_PLAYED: 'hero.played'
} as const;
export type HeroEvents = Values<typeof HERO_EVENTS>;

export class HeroPlayedEvent extends TypedSerializableEvent<
  { card: HeroCard },
  { card: string }
> {
  serialize() {
    return {
      card: this.data.card.id
    };
  }
}

export class HeroCardTakeDamageEvent extends TypedSerializableEvent<
  { card: HeroCard; damage: Damage; source: AnyCard; amount: number },
  {
    card: string;
    damage: { type: DamageType; amount: number };
    source: string;
    amount: number;
  }
> {
  serialize() {
    return {
      card: this.data.card.id,
      damage: {
        type: this.data.damage.type,
        amount: this.data.damage.getFinalAmount(this.data.card)
      },
      amount: this.data.amount,
      source: this.data.source.id
    };
  }
}

export class HeroCardHealEvent extends TypedSerializableEvent<
  { card: HeroCard; amount: number },
  { card: SerializedHeroCard; amount: number }
> {
  serialize() {
    return {
      card: this.data.card.serialize(),
      amount: this.data.amount
    };
  }
}

export class HeroLevelUpEvent extends TypedSerializableEvent<
  { from: HeroCard; to: HeroCard },
  { from: SerializedHeroCard; to: SerializedHeroCard }
> {
  serialize() {
    return {
      from: this.data.from.serialize(),
      to: this.data.to.serialize()
    };
  }
}

export type HeroCardEventMap = {
  [HERO_EVENTS.HERO_BEFORE_TAKE_DAMAGE]: HeroCardTakeDamageEvent;
  [HERO_EVENTS.HERO_AFTER_TAKE_DAMAGE]: HeroCardTakeDamageEvent;
  [HERO_EVENTS.HERO_BEFORE_HEAL]: HeroCardHealEvent;
  [HERO_EVENTS.HERO_AFTER_HEAL]: HeroCardHealEvent;
  [HERO_EVENTS.HERO_BEFORE_LEVEL_UP]: HeroLevelUpEvent;
  [HERO_EVENTS.HERO_AFTER_LEVEL_UP]: HeroLevelUpEvent;
  [HERO_EVENTS.HERO_PLAYED]: HeroPlayedEvent;
};
