import type { MaybePromise, Values } from '@game/shared';
import type { Game } from '../../game/game';
import type { Attacker, AttackTarget } from '../../game/phases/combat.phase';

import type { Player } from '../../player/player.entity';
import type { CombatDamage, Damage, DamageType } from '../../utils/damage';
import { Interceptable } from '../../utils/interceptable';
import { type HeroBlueprint, type PreResponseTarget } from '../card-blueprint';
import { type SpellSchool, type HeroJob, CARD_EVENTS } from '../card.enums';
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
import { AnywhereAttackRange, type AttackRange } from '../attack-range';
import type { MinionCard } from './minion.entity';
import { SingleTargetAOE, type AttackAOE } from '../attack-aoe';
import { CardDeclarePlayEvent } from '../card.events';
import { CorruptedGamephaseContextError } from '../../game/systems/game-phase.system';

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
  spellSchools: SpellSchool[];
  jobs: HeroJob[];
  canCounterattack: boolean;
};

export type HeroCardInterceptors = CardInterceptors & {
  canPlay: Interceptable<boolean, HeroCard>;
  canAttack: Interceptable<boolean, { target: AttackTarget }>;
  canBeAttacked: Interceptable<boolean, { attacker: Attacker }>;
  canCounterattack: Interceptable<boolean, { attacker: AttackTarget }>;
  canBeCounterattacked: Interceptable<boolean, { defender: AttackTarget }>;
  canBeDefended: Interceptable<boolean, { defender: AttackTarget }>;
  canBeTargeted: Interceptable<boolean, { source: AnyCard }>;
  canUseAbility: Interceptable<boolean, { card: HeroCard; ability: Ability<HeroCard> }>;
  receivedDamage: Interceptable<number, { damage: Damage }>;
  maxHp: Interceptable<number, HeroCard>;
  atk: Interceptable<number, HeroCard>;
  spellPower: Interceptable<number, HeroCard>;
  attackRanges: Interceptable<AttackRange[], HeroCard>;
  attackAOEs: Interceptable<AttackAOE[], HeroCard>;
};

export type HeroCardInterceptorName = keyof HeroCardInterceptors;

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
  { card: string; damage: { type: DamageType; amount: number } }
> {
  serialize() {
    return {
      card: this.data.card.id,
      damage: {
        type: this.data.damage.type,
        amount: this.data.damage.getFinalAmount(this.data.card)
      }
    };
  }
}

export class HeroBeforeDealCombatDamageEvent extends TypedSerializableEvent<
  {
    card: HeroCard;
    target: AttackTarget;
    damage: CombatDamage;
    affectedCards: Array<MinionCard | HeroCard>;
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

export class HeroAfterDealCombatDamageEvent extends TypedSerializableEvent<
  {
    card: HeroCard;
    target: AttackTarget;
    damage: CombatDamage;
    affectedCards: Array<MinionCard | HeroCard>;
  },
  {
    card: string;
    target: string;
    affectedCards: string[];
    damage: number;
    isFatal: boolean;
  }
> {
  serialize() {
    return {
      card: this.data.card.id,
      target: this.data.target.id,
      damage: this.data.damage.getFinalAmount(this.data.target),
      isFatal: !this.data.target.isAlive,
      affectedCards: this.data.affectedCards.map(card => card.id)
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
  [HERO_EVENTS.HERO_BEFORE_DEAL_COMBAT_DAMAGE]: HeroBeforeDealCombatDamageEvent;
  [HERO_EVENTS.HERO_AFTER_DEAL_COMBAT_DAMAGE]: HeroAfterDealCombatDamageEvent;
  [HERO_EVENTS.HERO_BEFORE_HEAL]: HeroCardHealEvent;
  [HERO_EVENTS.HERO_AFTER_HEAL]: HeroCardHealEvent;
  [HERO_EVENTS.HERO_BEFORE_LEVEL_UP]: HeroLevelUpEvent;
  [HERO_EVENTS.HERO_AFTER_LEVEL_UP]: HeroLevelUpEvent;
};

export class HeroCard extends Card<SerializedCard, HeroCardInterceptors, HeroBlueprint> {
  private damageTaken = 0;

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
        canBeAttacked: new Interceptable(),
        canBeDefended: new Interceptable(),
        canCounterattack: new Interceptable(),
        canBeCounterattacked: new Interceptable(),
        canUseAbility: new Interceptable(),
        canBeTargeted: new Interceptable(),
        receivedDamage: new Interceptable(),
        maxHp: new Interceptable(),
        atk: new Interceptable(),
        spellPower: new Interceptable(),
        attackRanges: new Interceptable(),
        attackAOEs: new Interceptable()
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

  get attackRanges(): AttackRange[] {
    return this.interceptors.attackRanges.getValue([new AnywhereAttackRange()], this);
  }

  get attackAOEs(): AttackAOE[] {
    return this.interceptors.attackAOEs.getValue([new SingleTargetAOE()], this);
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
    const p1t1Condition = this.game.config.ALLOW_PLAYER_1_TURN_1_ATTACK
      ? true
      : !this.player.isPlayer1 || this.game.turnSystem.elapsedTurns > 0;

    return this.interceptors.canAttack.getValue(
      !this._isExhausted && this.atk > 0 && target.canBeAttacked(this) && p1t1Condition,
      {
        target
      }
    );
  }

  canBeAttacked(attacker: AttackTarget) {
    return this.interceptors.canBeAttacked.getValue(true, {
      attacker
    });
  }

  canBeDefendedBy(defender: AttackTarget) {
    return this.interceptors.canBeDefended.getValue(true, {
      defender
    });
  }

  canBeCounterattackedBy(defender: AttackTarget) {
    return this.interceptors.canBeCounterattacked.getValue(true, {
      defender
    });
  }

  canCounterattack(target: AttackTarget) {
    const phaseCtx = this.game.gamePhaseSystem.getContext();
    if (phaseCtx.state !== GAME_PHASES.ATTACK || !phaseCtx.ctx.target?.equals(this)) {
      return false;
    }

    return this.interceptors.canCounterattack.getValue(
      !this.isExhausted &&
        this.atk > 0 &&
        phaseCtx.ctx.attacker.canBeCounterattackedBy(this),
      {
        attacker: target
      }
    );
  }

  async counterattack() {
    const phaseCtx = this.game.gamePhaseSystem.getContext();
    if (phaseCtx.state !== GAME_PHASES.ATTACK || !phaseCtx.ctx.target?.equals(this)) {
      throw new CorruptedGamephaseContextError();
    }
    await phaseCtx.ctx.counterAttack();
  }

  getReceivedDamage(damage: Damage) {
    return this.interceptors.receivedDamage.getValue(damage.baseAmount, {
      damage
    });
  }

  getAffectedCardsForAttack(target: AttackTarget) {
    if (target instanceof HeroCard) {
      return [target];
    }
    const affectedCards = new Set<MinionCard | HeroCard>();
    this.attackAOEs.forEach(aoe => {
      aoe.getAffectedCards(target.slot!).forEach(card => affectedCards.add(card));
    });

    return Array.from(affectedCards);
  }

  async dealDamage(target: AttackTarget, damage: CombatDamage) {
    const affectedCards = this.getAffectedCardsForAttack(target);
    await this.game.emit(
      HERO_EVENTS.HERO_BEFORE_DEAL_COMBAT_DAMAGE,
      new HeroBeforeDealCombatDamageEvent({
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
      HERO_EVENTS.HERO_AFTER_DEAL_COMBAT_DAMAGE,
      new HeroAfterDealCombatDamageEvent({
        card: this,
        target,
        damage,
        affectedCards
      })
    );
  }

  async takeDamage(source: AnyCard, damage: Damage) {
    await this.game.emit(
      HERO_EVENTS.HERO_BEFORE_TAKE_DAMAGE,
      new HeroCardTakeDamageEvent({ card: this, damage })
    );

    const amount = damage.getFinalAmount(this);

    this.damageTaken = Math.min(this.damageTaken + amount, this.maxHp);

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

  get spellSchools() {
    return this.blueprint.spellSchools;
  }

  get jobs() {
    return this.blueprint.jobs;
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
      return await this.blueprint.onPlay(this.game, this, this);
    }
    await this.game.emit(
      CARD_EVENTS.CARD_DECLARE_PLAY,
      new CardDeclarePlayEvent({ card: this })
    );

    await this.insertInChainOrExecute(
      async () => {
        await this.player.levelupHero(this);
        await this.blueprint.onPlay(this.game, this, this);
      },
      [],
      onResolved
    );
  }

  get potentialAttackTargets() {
    if (this.location !== 'board') return [];

    const result: Array<MinionCard | HeroCard> = this.player.opponent.boardSide
      .getAllMinions()
      .filter(
        minion =>
          this.attackRanges.some(range => range.canAttack(minion.slot!)) &&
          this.canAttack(minion)
      );

    if (
      this.attackRanges.some(range => range.canAttackHero()) &&
      this.canAttack(this.player.opponent.hero)
    ) {
      result.push(this.player.opponent.hero);
    }

    return result;
  }

  serialize(): SerializedHeroCard {
    const phaseCtx = this.game.gamePhaseSystem.getContext();
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
      jobs: this.blueprint.jobs,
      spellSchools: this.blueprint.spellSchools,
      canCounterattack:
        phaseCtx.state === GAME_PHASES.ATTACK &&
        phaseCtx.ctx.target?.equals(this) &&
        phaseCtx.ctx.target?.canCounterattack(this)
          ? this.canCounterattack(phaseCtx.ctx.attacker) &&
            phaseCtx.ctx.attacker.canBeCounterattackedBy(this)
          : false
    };
  }
}
