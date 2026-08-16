import type { Values } from '@game/shared';
import type { HeroCard, SerializedHeroCard } from '../entities/hero.entity';
import { TypedSerializableEvent } from '../../utils/typed-emitter';

export const HERO_EVENTS = {
  HERO_BEFORE_HEAL: 'hero.before-heal',
  HERO_AFTER_HEAL: 'hero.after-heal',
  HERO_BEFORE_LEVEL_UP: 'hero.before-level-up',
  HERO_AFTER_LEVEL_UP: 'hero.after-level-up',
  HERO_PLAYED: 'hero.played',
  HERO_STAT_CHANGED: 'hero.stat-changed'
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

export class HeroStatChangeEvent extends TypedSerializableEvent<
  { card: HeroCard; stat: 'might' | 'focus' | 'wisdom'; amount: number },
  { card: string; stat: 'might' | 'focus' | 'wisdom'; amount: number }
> {
  serialize() {
    return {
      card: this.data.card.id,
      stat: this.data.stat,
      amount: this.data.amount
    };
  }
}

export type HeroCardEventMap = {
  [HERO_EVENTS.HERO_BEFORE_HEAL]: HeroCardHealEvent;
  [HERO_EVENTS.HERO_AFTER_HEAL]: HeroCardHealEvent;
  [HERO_EVENTS.HERO_BEFORE_LEVEL_UP]: HeroLevelUpEvent;
  [HERO_EVENTS.HERO_AFTER_LEVEL_UP]: HeroLevelUpEvent;
  [HERO_EVENTS.HERO_PLAYED]: HeroPlayedEvent;
  [HERO_EVENTS.HERO_STAT_CHANGED]: HeroStatChangeEvent;
};
