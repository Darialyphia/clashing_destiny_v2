import type { Game } from '../../game/game';
import type { Attacker, AttackTarget } from '../../game/phases/combat.phase';

import type { Player } from '../../player/player.entity';
import type { CombatDamage, Damage } from '../../utils/damage';
import { Interceptable } from '../../utils/interceptable';
import {
  type AbilityBlueprint,
  type HeroBlueprint,
  type PreResponseTarget
} from '../card-blueprint';
import { CARD_EVENTS, CARD_LOCATIONS, type JobId } from '../card.enums';
import {
  Card,
  makeCardInterceptors,
  type AnyCard,
  type CardInterceptors,
  type CardOptions,
  type SerializedCard
} from './card.entity';
import { GAME_PHASES } from '../../game/game.enums';
import { Ability } from './ability.entity';
import type { MinionCard } from './minion.entity';
import {
  CardAfterDealCombatDamageEvent,
  CardAfterPlayEvent,
  CardAfterTakeDamageEvent,
  CardBeforeDealCombatDamageEvent,
  CardBeforePlayEvent,
  CardBeforeTakeDamageEvent
} from '../card.events';
import { HERO_EVENTS, HeroCardHealEvent, HeroPlayedEvent } from '../events/hero.events';
import { DamageTrackerComponent } from '../components/damage-tracker.component';

export type SerializedHeroCard = SerializedCard & {
  potentialAttackTargets: string[];
  atk: number;
  baseAtk: number;
  retaliation: number;
  baseRetaliation: number;
  spellPower: number;
  baseSpellPower: number;
  maxHp: number;
  baseMaxHp: number;
  remainingHp: number;
  abilities: string[];
  jobs: JobId[];
};

export type HeroCardInterceptors = CardInterceptors & {
  canPlay: Interceptable<boolean, HeroCard>;
  canAttack: Interceptable<boolean, { target: AttackTarget }>;
  canBlock: Interceptable<boolean, { attacker: AttackTarget }>;
  canBeBlocked: Interceptable<boolean, { attacker: AttackTarget; target: AttackTarget }>;
  canBeAttacked: Interceptable<boolean, { attacker: Attacker }>;
  canBeTargeted: Interceptable<boolean, { source: AnyCard }>;
  canRetaliate: Interceptable<boolean, { attacker: AttackTarget }>;
  canBeRetaliatedAgainst: Interceptable<boolean, { defender: AttackTarget }>;
  canUseAbility: Interceptable<boolean, { card: HeroCard; ability: Ability<HeroCard> }>;
  receivedDamage: Interceptable<number, { damage: Damage }>;
  maxHp: Interceptable<number, HeroCard>;
  atk: Interceptable<number, HeroCard>;
  retaliation: Interceptable<number, HeroCard>;
  spellPower: Interceptable<number, HeroCard>;
  dealsDamageFirst: Interceptable<boolean, HeroCard>;
  shouldSwitchInitiativeAfterattacking: Interceptable<boolean, { target: AttackTarget }>;
};

export type HeroCardInterceptorName = keyof HeroCardInterceptors;

export class HeroCard extends Card<SerializedCard, HeroCardInterceptors, HeroBlueprint> {
  private damageTaken = 0;

  private shield = 0;

  readonly abilityTargets = new Map<string, PreResponseTarget[]>();

  readonly abilities: Ability<HeroCard>[] = [];

  readonly damageTracker: DamageTrackerComponent;

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
        canRetaliate: new Interceptable(),
        canBeRetaliatedAgainst: new Interceptable(),
        canUseAbility: new Interceptable(),
        canBeTargeted: new Interceptable(),
        receivedDamage: new Interceptable(),
        maxHp: new Interceptable(),
        atk: new Interceptable(),
        retaliation: new Interceptable(),
        spellPower: new Interceptable(),
        dealsDamageFirst: new Interceptable(),
        shouldSwitchInitiativeAfterattacking: new Interceptable()
      },
      options
    );

    this.damageTracker = new DamageTrackerComponent(game, this);
    this.blueprint.abilities.forEach(ability => {
      this.abilities.push(new Ability<HeroCard>(this.game, this, ability));
    });
  }

  protected async onInterceptorAdded(key: HeroCardInterceptorName) {
    if (key === 'maxHp') {
      await this.checkHp(this);
    }
  }

  protected async onInterceptorRemoved(key: HeroCardInterceptorName) {
    if (key === 'maxHp') {
      await this.checkHp(this);
    }
  }

  private async checkHp(source: AnyCard) {
    if (this.remainingHp <= 0) {
      await this.destroy(source);
    }
  }

  cloneDamageTaken(previousHero: HeroCard) {
    this.damageTaken = previousHero.damageTaken;
  }

  get isAlive() {
    return this.remainingHp > 0 && this.location === CARD_LOCATIONS.BOARD;
  }

  get atk(): number {
    return this.interceptors.atk.getValue(this.blueprint.atk, this);
  }

  get retaliation(): number {
    return this.interceptors.retaliation.getValue(this.blueprint.retaliation, this);
  }

  get spellPower(): number {
    return this.interceptors.spellPower.getValue(0, this);
  }

  get maxHp(): number {
    return this.interceptors.maxHp.getValue(this.blueprint.maxHp, this);
  }

  get remainingHp(): number {
    return Math.max(this.maxHp - this.damageTaken, 0);
  }

  get isAttacking() {
    const phaseCtx = this.game.gamePhaseSystem.getContext();
    return phaseCtx.state === GAME_PHASES.COMBAT && phaseCtx.ctx.attacker?.equals(this);
  }

  shouldSwitchInitiativeAfterAttacking(attackTarget: AttackTarget): boolean {
    return this.interceptors.shouldSwitchInitiativeAfterattacking.getValue(true, {
      target: attackTarget
    });
  }

  get dealsDamageFirst(): boolean {
    return this.interceptors.dealsDamageFirst.getValue(false, this);
  }

  canBeTargeted(source: AnyCard) {
    return this.interceptors.canBeTargeted.getValue(true, {
      source
    });
  }

  canAttack(target: AttackTarget) {
    return this.interceptors.canAttack.getValue(
      !this._isExhausted && this.atk > 0 && target.canBeAttacked(this),
      { target }
    );
  }

  canBeAttacked(attacker: AttackTarget) {
    return this.interceptors.canBeAttacked.getValue(true, {
      attacker
    });
  }

  canBeRetaliatedBy(defender: AttackTarget) {
    return this.interceptors.canBeRetaliatedAgainst.getValue(true, {
      defender
    });
  }

  canRetaliate(target: AttackTarget) {
    const phaseCtx = this.game.gamePhaseSystem.getContext();
    if (phaseCtx.state !== GAME_PHASES.COMBAT) return false;
    if (!phaseCtx.ctx.defender?.equals(this)) return false;

    return this.interceptors.canRetaliate.getValue(
      !this.isExhausted &&
        this.atk > 0 &&
        !!phaseCtx.ctx.attacker?.canBeRetaliatedBy(this),
      {
        attacker: target
      }
    );
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
      CARD_EVENTS.CARD_BEFORE_TAKE_DAMAGE,
      new CardBeforeTakeDamageEvent({
        card: this,
        damage,
        source,
        amount: remainingDamage
      })
    );

    this.damageTaken = Math.min(this.damageTaken + remainingDamage, this.maxHp);

    await this.game.emit(
      CARD_EVENTS.CARD_AFTER_TAKE_DAMAGE,
      new CardAfterTakeDamageEvent({
        card: this,
        damage,
        source,
        amount: remainingDamage,
        isFatal: this.remainingHp <= 0
      })
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
    this.abilities.splice(index, 1);
  }

  get jobs() {
    return this.blueprint.jobs;
  }

  get isCorrectPhaseToPlay() {
    return this.game.gamePhaseSystem.getContext().state === GAME_PHASES.MAIN;
  }

  canPlay() {
    return this.interceptors.canPlay.getValue(
      this.canPlayBase &&
        this.isCorrectPhaseToPlay &&
        this.blueprint.canPlay(this.game, this),
      this
    );
  }

  get unplayableReason() {
    const base = super.unplayableReason;
    if (base !== 'You cannot play this card.') return base;

    return base;
  }

  async play() {
    await this.game.emit(
      CARD_EVENTS.CARD_BEFORE_PLAY,
      new CardBeforePlayEvent({ card: this })
    );

    await this.blueprint.onPlay(this.game, this, this);
    await this.game.emit(HERO_EVENTS.HERO_PLAYED, new HeroPlayedEvent({ card: this }));
    await this.game.emit(
      CARD_EVENTS.CARD_AFTER_PLAY,
      new CardAfterPlayEvent({ card: this })
    );
  }

  get potentialAttackTargets(): Array<MinionCard | HeroCard> {
    if (this.location !== CARD_LOCATIONS.BOARD) return [];

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
      retaliation: this.retaliation,
      baseRetaliation: this.blueprint.retaliation,
      spellPower: this.spellPower,
      baseSpellPower: this.spellPower,
      maxHp: this.maxHp,
      baseMaxHp: this.blueprint.maxHp,
      remainingHp: this.maxHp - this.damageTaken,
      abilities: this.abilities.map(ability => ability.id),
      jobs: this.jobs.map(job => job.id) as JobId[]
    };
  }
}
