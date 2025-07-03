import type { Values } from '@game/shared';
import type { Game } from '../../game/game';
import type { Player } from '../../player/player.entity';
import type { CombatDamage, Damage, DamageType } from '../../utils/damage';
import { Interceptable } from '../../utils/interceptable';
import { type HeroBlueprint, type PreResponseTarget } from '../card-blueprint';
import { CARD_EVENTS, type Affinity } from '../card.enums';
import { CardAfterPlayEvent, CardBeforePlayEvent } from '../card.events';
import {
  Card,
  makeCardInterceptors,
  type AnyCard,
  type CardInterceptors,
  type CardOptions,
  type SerializedCard
} from './card.entity';
import { TypedSerializableEvent } from '../../utils/typed-emitter';
import type { MinionCard } from './minion.card';

export type SerializedHeroCard = SerializedCard & {
  level: number;
  atk: number;
  baseAtk: number;
  spellPower: number;
  baseSpellPower: number;
  maxHp: number;
  baseMaxHp: number;
  remainingHp: number;
  unlockableAffinities: string[];
};
export type HeroCardInterceptors = CardInterceptors & {
  canPlay: Interceptable<boolean, HeroCard>;
  canAttack: Interceptable<boolean, { target: MinionCard | HeroCard }>;
  canBeAttacked: Interceptable<boolean, { target: MinionCard | HeroCard }>;
  canBeTargeted: Interceptable<boolean, { source: AnyCard }>;
  receivedDamage: Interceptable<number, { damage: Damage }>;
  maxHp: Interceptable<number, HeroCard>;
  atk: Interceptable<number, HeroCard>;
  spellPower: Interceptable<number, HeroCard>;
};

export const HERO_EVENTS = {
  HERO_BEFORE_TAKE_DAMAGE: 'hero.before-take-damage',
  HERO_AFTER_TAKE_DAMAGE: 'hero.after-take-damage',
  HERO_BEFORE_DEAL_COMBAT_DAMAGE: 'hero.before-deal-combat-damage',
  HERO_AFTER_DEAL_COMBAT_DAMAGE: 'hero.after-deal-combat-damage',
  HERO_BEFORE_HEAL: 'hero.before-heal',
  HERO_AFTER_HEAL: 'hero.after-heal',
  HERO_BEFORE_LEVEL_UP: 'hero.before-level-up',
  HERO_AFTER_LEVEL_UP: 'hero.after-level-up'
} as const;
export type HeroEvents = Values<typeof HERO_EVENTS>;

export class HeroCardTakeDamageEvent extends TypedSerializableEvent<
  { card: HeroCard; damage: Damage },
  { card: SerializedHeroCard; damage: { type: DamageType; amount: number } }
> {
  serialize() {
    return {
      card: this.data.card.serialize(),
      damage: {
        type: this.data.damage.type,
        amount: this.data.damage.getFinalAmount(this.data.card)
      }
    };
  }
}

export class HeroDealCombatDamageEvent extends TypedSerializableEvent<
  {
    card: HeroCard;
    target: MinionCard | HeroCard;
    damage: CombatDamage;
  },
  { card: SerializedHeroCard; target: string; damage: number }
> {
  serialize() {
    return {
      card: this.data.card.serialize(),
      target: this.data.target.id,
      damage: this.data.damage.getFinalAmount(this.data.target)
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

export class HeroUsedAbilityEvent extends TypedSerializableEvent<
  { card: HeroCard; abilityId: string },
  { card: SerializedHeroCard; abilityId: string }
> {
  serialize() {
    return {
      card: this.data.card.serialize(),
      abilityId: this.data.abilityId
    };
  }
}

export class HeroLevelUpEvent extends TypedSerializableEvent<
  { card: HeroCard },
  { card: SerializedHeroCard }
> {
  serialize() {
    return {
      card: this.data.card.serialize()
    };
  }
}

export type HeroCardEventMap = {
  [HERO_EVENTS.HERO_BEFORE_TAKE_DAMAGE]: HeroCardTakeDamageEvent;
  [HERO_EVENTS.HERO_AFTER_TAKE_DAMAGE]: HeroCardTakeDamageEvent;
  [HERO_EVENTS.HERO_BEFORE_DEAL_COMBAT_DAMAGE]: HeroDealCombatDamageEvent;
  [HERO_EVENTS.HERO_AFTER_DEAL_COMBAT_DAMAGE]: HeroDealCombatDamageEvent;
  [HERO_EVENTS.HERO_BEFORE_HEAL]: HeroCardHealEvent;
  [HERO_EVENTS.HERO_AFTER_HEAL]: HeroCardHealEvent;
  [HERO_EVENTS.HERO_BEFORE_LEVEL_UP]: HeroLevelUpEvent;
  [HERO_EVENTS.HERO_AFTER_LEVEL_UP]: HeroLevelUpEvent;
};

export class HeroCard extends Card<SerializedCard, HeroCardInterceptors, HeroBlueprint> {
  private damageTaken = 0;

  private abilityTargets = new Map<string, PreResponseTarget[]>();

  unlockedAffinity!: Affinity;

  constructor(game: Game, player: Player, options: CardOptions<HeroBlueprint>) {
    super(
      game,
      player,
      {
        ...makeCardInterceptors(),
        canPlay: new Interceptable(),
        canAttack: new Interceptable(),
        canBeAttacked: new Interceptable(),
        canBeTargeted: new Interceptable(),
        receivedDamage: new Interceptable(),
        maxHp: new Interceptable(),
        atk: new Interceptable(),
        spellPower: new Interceptable()
      },
      options
    );
  }

  get level() {
    return 0;
  }

  get isAlive() {
    return this.remainingHp > 0 && this.location === 'board';
  }

  get atk(): number {
    const weapon = this.player.artifactManager.artifacts.weapon;
    const baseAttack = this.blueprint.atk + (weapon?.atk ?? 0);
    return this.interceptors.atk.getValue(baseAttack, this);
  }

  get spellPower(): number {
    return this.interceptors.spellPower.getValue(this.blueprint.spellPower, this);
  }

  get maxHp(): number {
    return this.interceptors.maxHp.getValue(this.blueprint.maxHp, this);
  }

  get remainingHp(): number {
    return Math.max(this.maxHp - this.damageTaken, 0);
  }

  get unlockableAffinities() {
    return this.blueprint.affinities;
  }

  canBeTargeted(source: AnyCard) {
    return this.interceptors.canBeTargeted.getValue(true, {
      source
    });
  }

  canAttack(target: MinionCard | HeroCard) {
    return this.interceptors.canAttack.getValue(!this._isExhausted && this.atk > 0, {
      target
    });
  }

  canBeAttacked(target: MinionCard | HeroCard) {
    return this.interceptors.canBeAttacked.getValue(true, {
      target
    });
  }

  getReceivedDamage(damage: Damage) {
    return this.interceptors.receivedDamage.getValue(damage.baseAmount, {
      damage
    });
  }

  async dealDamage(target: MinionCard | HeroCard, damage: CombatDamage) {
    await this.game.emit(
      HERO_EVENTS.HERO_BEFORE_DEAL_COMBAT_DAMAGE,
      new HeroDealCombatDamageEvent({ card: this, target, damage })
    );

    await target.takeDamage(this, damage);

    await this.game.emit(
      HERO_EVENTS.HERO_AFTER_DEAL_COMBAT_DAMAGE,
      new HeroDealCombatDamageEvent({ card: this, target, damage })
    );
  }

  async takeDamage(source: AnyCard, damage: Damage) {
    await this.game.emit(
      HERO_EVENTS.HERO_BEFORE_TAKE_DAMAGE,
      new HeroCardTakeDamageEvent({ card: this, damage })
    );

    const amount = damage.getFinalAmount(this);

    const armor = this.player.artifactManager.artifacts.armor;
    if (armor) {
      const absorbed = Math.min(armor.remainingDurability, amount);
      await armor.loseDurability(absorbed);

      this.damageTaken = Math.min(this.damageTaken + amount - absorbed, this.maxHp);
    } else {
      this.damageTaken = Math.min(this.damageTaken + amount, this.maxHp);
    }

    await this.game.emit(
      HERO_EVENTS.HERO_AFTER_TAKE_DAMAGE,
      new HeroCardTakeDamageEvent({ card: this, damage })
    );
  }

  async heal(heal: number) {
    await this.game.emit(
      HERO_EVENTS.HERO_BEFORE_HEAL,
      new HeroCardHealEvent({ card: this, amount: heal })
    );
    this.damageTaken = Math.max(this.damageTaken - heal, 0);
    await this.game.emit(
      HERO_EVENTS.HERO_AFTER_HEAL,
      new HeroCardHealEvent({ card: this, amount: heal })
    );
  }

  canPlay() {
    return true;
  }

  async play() {
    await this.game.emit(
      CARD_EVENTS.CARD_BEFORE_PLAY,
      new CardBeforePlayEvent({ card: this })
    );
    this.updatePlayedAt();

    await this.blueprint.onPlay(this.game, this, this);

    await this.game.emit(
      CARD_EVENTS.CARD_AFTER_PLAY,
      new CardAfterPlayEvent({ card: this })
    );
  }

  async levelup() {
    await this.game.emit(
      HERO_EVENTS.HERO_BEFORE_LEVEL_UP,
      new HeroLevelUpEvent({ card: this })
    );

    await this.game.emit(
      HERO_EVENTS.HERO_AFTER_LEVEL_UP,
      new HeroLevelUpEvent({ card: this })
    );
  }

  serialize(): SerializedHeroCard {
    return {
      ...this.serializeBase(),
      level: this.level,
      atk: this.atk,
      baseAtk: this.blueprint.atk,
      spellPower: this.spellPower,
      baseSpellPower: this.blueprint.spellPower,
      maxHp: this.maxHp,
      baseMaxHp: this.blueprint.maxHp,
      remainingHp: this.maxHp - this.damageTaken,
      unlockableAffinities: this.blueprint.affinities
    };
  }
}
