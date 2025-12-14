import type { MaybePromise, Values } from '@game/shared';
import type { Game } from '../../game/game';
import type { Attacker, AttackTarget } from '../../game/phases/combat.phase';

import type { Player } from '../../player/player.entity';
import type { CombatDamage, Damage, DamageType } from '../../utils/damage';
import { Interceptable } from '../../utils/interceptable';
import {
  type AbilityBlueprint,
  type HeroBlueprint,
  type PreResponseTarget
} from '../card-blueprint';
import { CARD_EVENTS } from '../card.enums';
import {
  Card,
  makeCardInterceptors,
  type AnyCard,
  type CardInterceptors,
  type CardOptions,
  type SerializedCard
} from './card.entity';
import { TypedSerializableEvent } from '../../utils/typed-emitter';
import { GAME_PHASES } from '../../game/game.enums';
import { Ability } from './ability.entity';
import type { MinionCard } from './minion.entity';
import {
  CardAfterDealCombatDamageEvent,
  CardBeforeDealCombatDamageEvent,
  CardDeclarePlayEvent
} from '../card.events';

export type SerializedHeroCard = SerializedCard & {
  potentialAttackTargets: string[];
  atk: number;
  baseAtk: number;
  spellPower: number;
  baseSpellPower: number;
  maxHp: number;
  baseMaxHp: number;
  remainingHp: number;
  abilities: string[];
  level: number;
};

export type HeroCardInterceptors = CardInterceptors & {
  canPlay: Interceptable<boolean, HeroCard>;
  canAttack: Interceptable<boolean, { target: AttackTarget }>;
  canBlock: Interceptable<boolean, { attacker: AttackTarget }>;
  canBeBlocked: Interceptable<boolean, { attacker: AttackTarget; target: AttackTarget }>;
  canBeAttacked: Interceptable<boolean, { attacker: Attacker }>;
  canBeDefended: Interceptable<boolean, { defender: AttackTarget }>;
  canBeTargeted: Interceptable<boolean, { source: AnyCard }>;
  canUseAbility: Interceptable<boolean, { card: HeroCard; ability: Ability<HeroCard> }>;
  receivedDamage: Interceptable<number, { damage: Damage }>;
  maxHp: Interceptable<number, HeroCard>;
  atk: Interceptable<number, HeroCard>;
  spellPower: Interceptable<number, HeroCard>;
};

export type HeroCardInterceptorName = keyof HeroCardInterceptors;

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

export class HeroCard extends Card<SerializedCard, HeroCardInterceptors, HeroBlueprint> {
  private damageTaken = 0;

  private shield = 0;

  readonly abilityTargets = new Map<string, PreResponseTarget[]>();

  readonly abilities: Ability<HeroCard>[] = [];

  constructor(game: Game, player: Player, options: CardOptions<HeroBlueprint>) {
    super(
      game,
      player,
      {
        ...makeCardInterceptors(),
        canPlay: new Interceptable(),
        canAttack: new Interceptable(),
        canBlock: new Interceptable(),
        canBeBlocked: new Interceptable(),
        canBeAttacked: new Interceptable(),
        canBeDefended: new Interceptable(),
        canUseAbility: new Interceptable(),
        canBeTargeted: new Interceptable(),
        receivedDamage: new Interceptable(),
        maxHp: new Interceptable(),
        atk: new Interceptable(),
        spellPower: new Interceptable()
      },
      options
    );

    this.blueprint.abilities.forEach(ability => {
      this.abilities.push(new Ability<HeroCard>(this.game, this, ability));
    });
  }

  protected async onInterceptorAdded(key: HeroCardInterceptorName) {
    if (key === 'maxHp') {
      await this.checkHp();
    }
  }

  protected async onInterceptorRemoved(key: HeroCardInterceptorName) {
    if (key === 'maxHp') {
      await this.checkHp();
    }
  }

  private async checkHp() {
    if (this.remainingHp <= 0) {
      await this.destroy();
    }
  }

  cloneDamageTaken(previousHero: HeroCard) {
    this.damageTaken = previousHero.damageTaken;
  }

  get isAlive() {
    return this.remainingHp > 0 && this.location === 'board';
  }

  get atk(): number {
    return this.interceptors.atk.getValue(this.blueprint.atk, this);
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

  get isAttacking() {
    const phaseCtx = this.game.gamePhaseSystem.getContext();
    return phaseCtx.state === GAME_PHASES.ATTACK && phaseCtx.ctx.attacker.equals(this);
  }

  canBeTargeted(source: AnyCard) {
    return this.interceptors.canBeTargeted.getValue(true, {
      source
    });
  }

  canAttack(target: AttackTarget) {
    return this.interceptors.canAttack.getValue(
      !this._isExhausted &&
        this.atk > 0 &&
        target.canBeAttacked(this) &&
        !this.game.effectChainSystem.currentChain,
      { target }
    );
  }

  canBeAttacked(attacker: AttackTarget) {
    return this.interceptors.canBeAttacked.getValue(true, {
      attacker
    });
  }

  canBeBlocked(attacker: AttackTarget, target: AttackTarget) {
    return this.interceptors.canBeBlocked.getValue(true, {
      attacker,
      target
    });
  }

  canBeDefended(defender: AttackTarget) {
    return this.interceptors.canBeDefended.getValue(true, {
      defender
    });
  }

  getReceivedDamage(damage: Damage) {
    return this.interceptors.receivedDamage.getValue(damage.baseAmount, {
      damage
    });
  }

  async dealDamage(target: AttackTarget, damage: CombatDamage) {
    const affectedCards = [target];
    await this.game.emit(
      CARD_EVENTS.CARD_BEFORE_DEAL_COMBAT_DAMAGE,
      new CardBeforeDealCombatDamageEvent({
        card: this,
        target,
        damage,
        affectedCards
      })
    );

    for (const card of affectedCards) {
      await card.takeDamage(this, damage);
    }

    await this.game.emit(
      CARD_EVENTS.CARD_AFTER_DEAL_COMBAT_DAMAGE,
      new CardAfterDealCombatDamageEvent({
        card: this,
        target,
        damage,
        affectedCards
      })
    );
  }

  async takeDamage(source: AnyCard, damage: Damage) {
    const amount = damage.getFinalAmount(this);
    const amountBlocked = Math.min(this.shield, amount);
    this.shield -= amountBlocked;
    const remainingDamage = amount - amountBlocked;

    await this.game.emit(
      HERO_EVENTS.HERO_BEFORE_TAKE_DAMAGE,
      new HeroCardTakeDamageEvent({ card: this, damage, source, amount: remainingDamage })
    );

    this.damageTaken = Math.min(this.damageTaken + remainingDamage, this.maxHp);

    await this.game.emit(
      HERO_EVENTS.HERO_AFTER_TAKE_DAMAGE,
      new HeroCardTakeDamageEvent({ card: this, damage, source, amount: remainingDamage })
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

  gainShield(amount: number) {
    this.shield += amount;
  }

  depleteShield(amount?: number) {
    if (amount === undefined) {
      this.shield = 0;
    } else {
      this.shield = Math.max(this.shield - amount, 0);
    }
  }

  canUseAbility(id: string) {
    const ability = this.abilities.find(ability => ability.abilityId === id);
    if (!ability) return false;

    return this.interceptors.canUseAbility.getValue(ability.canUse, {
      card: this,
      ability
    });
  }

  replaceAbilityTarget(abilityId: string, oldTarget: AnyCard, newTarget: AnyCard) {
    const targets = this.abilityTargets.get(abilityId);
    if (!targets) return;
    if (newTarget instanceof Card) {
      const index = targets.findIndex(t => t instanceof Card && t.equals(oldTarget));
      if (index === -1) return;

      const oldTarget = targets[index] as AnyCard;
      oldTarget.clearTargetedBy({ type: 'ability', abilityId, card: this });

      targets[index] = newTarget;
      newTarget.targetBy({ type: 'ability', abilityId, card: this });
    }
  }

  addAbility(ability: AbilityBlueprint<HeroCard, PreResponseTarget>) {
    const newAbility = new Ability<HeroCard>(this.game, this, ability);
    this.abilities.push(newAbility);
    return newAbility;
  }

  removeAbility(abilityId: string) {
    const index = this.abilities.findIndex(a => a.abilityId === abilityId);
    if (index === -1) return;
    this.abilityTargets.delete(abilityId);
  }

  get level() {
    return this.blueprint.level;
  }

  get lineage() {
    return this.blueprint.lineage;
  }

  get hasCorrectLevelToPlay() {
    return this.player.hero.level === this.blueprint.level - 1;
  }

  get hasCorrectLineageToPlay() {
    if (this.level <= 1) return true;

    return !this.lineage || this.player.hero.lineage === this.lineage;
  }

  canPlay() {
    return this.interceptors.canPlay.getValue(
      this.canPlayBase &&
        this.hasCorrectLevelToPlay &&
        this.hasCorrectLineageToPlay &&
        this.blueprint.canPlay(this.game, this),
      this
    );
  }

  async play(onResolved: () => MaybePromise<void>) {
    if (this.level === 0) {
      await this.game.emit(
        CARD_EVENTS.CARD_BEFORE_PLAY,
        new CardDeclarePlayEvent({ card: this })
      );
      await this.player.levelupHero(this);
      await this.blueprint.onPlay(this.game, this, this);
      await this.game.emit(HERO_EVENTS.HERO_PLAYED, new HeroPlayedEvent({ card: this }));
      await this.game.emit(
        CARD_EVENTS.CARD_AFTER_PLAY,
        new CardDeclarePlayEvent({ card: this })
      );
      return;
    }

    await this.game.emit(
      CARD_EVENTS.CARD_DECLARE_PLAY,
      new CardDeclarePlayEvent({ card: this })
    );

    await this.insertInChainOrExecute(
      async () => {
        await this.player.levelupHero(this);
        await this.blueprint.onPlay(this.game, this, this);
        await this.game.emit(
          HERO_EVENTS.HERO_PLAYED,
          new HeroPlayedEvent({ card: this })
        );
      },
      [],
      onResolved
    );
  }

  get potentialAttackTargets(): Array<MinionCard | HeroCard> {
    if (this.location !== 'board') return [];

    return [
      this.player.opponent.hero,
      ...this.player.opponent.boardSide.getAllMinions()
    ].filter(target => this.canAttack(target));
  }

  serialize(): SerializedHeroCard {
    return {
      ...this.serializeBase(),
      potentialAttackTargets: this.potentialAttackTargets.map(target => target.id),
      atk: this.atk,
      baseAtk: this.blueprint.atk,
      spellPower: this.spellPower,
      baseSpellPower: this.blueprint.spellPower,
      maxHp: this.maxHp,
      baseMaxHp: this.blueprint.maxHp,
      remainingHp: this.maxHp - this.damageTaken,
      abilities: this.abilities.map(ability => ability.id),
      level: this.level
    };
  }
}
