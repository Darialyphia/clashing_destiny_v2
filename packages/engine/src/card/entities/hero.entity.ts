import type { Game } from '../../game/game';
import type { Player } from '../../player/player.entity';
import type { CombatDamage, Damage } from '../../utils/damage';
import { Interceptable } from '../../utils/interceptable';
import {
  type AbilityBlueprint,
  type HeroBlueprint,
  type Targets
} from '../card-blueprint';
import { CARD_EVENTS, CARD_LOCATIONS, type Affinity, type JobId } from '../card.enums';
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
import type { Attacker, AttackTarget } from '../../game/systems/combat.system';
import { AbilityManagerComponent } from '../components/abilities-manager.component';

export type SerializedHeroCard = SerializedCard & {
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
  canBeAttacked: Interceptable<boolean, { attacker: Attacker }>;
  canBeTargeted: Interceptable<boolean, { source: AnyCard }>;
  canUseAbility: Interceptable<boolean, { card: HeroCard; ability: Ability<HeroCard> }>;
  receivedDamage: Interceptable<number, { damage: Damage }>;
  maxHp: Interceptable<number, HeroCard>;
  spellPower: Interceptable<number, HeroCard>;
};

export type HeroCardInterceptorName = keyof HeroCardInterceptors;

export class HeroCard extends Card<SerializedCard, HeroCardInterceptors, HeroBlueprint> {
  private damageTaken = 0;

  readonly abilityManager: AbilityManagerComponent<HeroCard>;

  readonly damageTracker: DamageTrackerComponent;

  constructor(game: Game, player: Player, options: CardOptions<HeroBlueprint>) {
    super(
      game,
      player,
      {
        ...makeCardInterceptors(),
        canPlay: new Interceptable(),
        canBeAttacked: new Interceptable(),
        canUseAbility: new Interceptable(),
        canBeTargeted: new Interceptable(),
        receivedDamage: new Interceptable(),
        maxHp: new Interceptable(),
        spellPower: new Interceptable()
      },
      options
    );

    this.damageTracker = new DamageTrackerComponent(game, this);
    this.abilityManager = new AbilityManagerComponent<HeroCard>(game, this);
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
    return this.remainingHp > 0;
  }

  isValidMovementPosition() {
    return false;
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

  canBeTargeted(source: AnyCard) {
    return this.interceptors.canBeTargeted.getValue(true, {
      source
    });
  }

  canBeAttacked(attacker: Attacker) {
    return this.interceptors.canBeAttacked.getValue(true, {
      attacker
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

    await this.game.emit(
      CARD_EVENTS.CARD_BEFORE_TAKE_DAMAGE,
      new CardBeforeTakeDamageEvent({
        card: this,
        damage,
        source,
        amount: amount
      })
    );

    this.damageTaken = Math.min(this.damageTaken + amount, this.maxHp);

    await this.game.emit(
      CARD_EVENTS.CARD_AFTER_TAKE_DAMAGE,
      new CardAfterTakeDamageEvent({
        card: this,
        damage,
        source,
        amount: amount,
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

  canUseAbility(id: string) {
    const ability = this.abilityManager.getAbility(id);
    if (!ability) return false;

    return this.interceptors.canUseAbility.getValue(
      this.abilityManager.canUseAbility(id),
      {
        card: this,
        ability
      }
    );
  }

  addAbility(ability: AbilityBlueprint<HeroCard, any>) {
    return this.abilityManager.addAbility(ability);
  }

  removeAbility(abilityId: string) {
    this.abilityManager.removeAbility(abilityId);
  }

  get jobs() {
    return this.blueprint.jobs;
  }

  get isCorrectPhaseToPlay() {
    return this.game.gamePhaseSystem.getContext().state === GAME_PHASES.MAIN;
  }

  canPlay() {
    return true;
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

    return { cancelled: false };
  }

  get potentialAttackTargets(): Array<MinionCard | HeroCard> {
    return []; // pending refactor making heroes unable to attack
  }

  serialize(): SerializedHeroCard {
    return {
      ...this.serializeBase(),
      spellPower: this.spellPower,
      baseSpellPower: this.spellPower,
      maxHp: this.maxHp,
      baseMaxHp: this.blueprint.maxHp,
      remainingHp: this.maxHp - this.damageTaken,
      abilities: this.abilityManager.serialize(),
      jobs: this.jobs.map(job => job.id) as JobId[]
    };
  }
}
