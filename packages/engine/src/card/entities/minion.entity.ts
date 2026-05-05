import type { Game } from '../../game/game';
import type { Attacker, AttackTarget } from '../../game/phases/combat.phase';
import type { Player } from '../../player/player.entity';
import { CombatDamage, type Damage } from '../../utils/damage';
import { Interceptable } from '../../utils/interceptable';
import {
  type AbilityBlueprint,
  type MinionBlueprint,
  type Target
} from '../card-blueprint';
import {
  CARD_EVENTS,
  CARD_LOCATIONS,
  CARD_SPEED,
  type CardSpeed,
  type JobId
} from '../card.enums';
import {
  CardAfterDealCombatDamageEvent,
  CardAfterTakeDamageEvent,
  CardBeforeDealCombatDamageEvent,
  CardBeforePlayEvent,
  CardBeforeTakeDamageEvent,
  CardPlayEvent
} from '../card.events';
import {
  Card,
  makeCardInterceptors,
  type AnyCard,
  type CardInterceptors,
  type CardOptions,
  type SerializedCard
} from './card.entity';
import { GAME_PHASES } from '../../game/game.enums';
import { SummoningSicknessModifier } from '../../modifier/modifiers/summoning-sickness';
import { Ability } from './ability.entity';
import { HeroCard } from './hero.entity';
import {
  MINION_EVENTS,
  MinionCardHealEvent,
  MinionSummonedEvent
} from '../events/minion.events';
import { DamageTrackerComponent } from '../components/damage-tracker.component';
import { GAME_EVENTS } from '../../game/game.events';
import type { BoardSpace } from '../../board/board-space.entity';

export type SerializedMinionCard = SerializedCard & {
  potentialAttackTargets: string[];
  potentialMoveTargets: string[];
  baseAtk: number;
  atk: number;
  baseMaxHp: number;
  maxHp: number;
  remainingHp: number;
  manaCost: number;
  baseManaCost: number;
  abilities: string[];
  canMove: boolean;
  jobs: JobId[];
  hasSummoningSickness: boolean;
  speed: CardSpeed;
};

export type MinionCardInterceptors = CardInterceptors & {
  hasSummoningSickness: Interceptable<boolean, MinionCard>;
  canPlay: Interceptable<boolean, MinionCard>;
  canAttack: Interceptable<boolean, { target: AttackTarget }>;
  canBeAttacked: Interceptable<boolean, { attacker: Attacker }>;
  canRetaliate: Interceptable<boolean, { attacker: AttackTarget }>;
  canBeRetaliatedAgainst: Interceptable<boolean, { defender: AttackTarget }>;
  canUseAbility: Interceptable<
    boolean,
    { card: MinionCard; ability: Ability<MinionCard> }
  >;
  canBeTargeted: Interceptable<boolean, { source: AnyCard }>;
  receivedDamage: Interceptable<number, { damage: Damage }>;
  maxHp: Interceptable<number, MinionCard>;
  atk: Interceptable<number, MinionCard>;
  dealsDamageFirst: Interceptable<boolean, MinionCard>;
  canMove: Interceptable<boolean, MinionCard>;
  canMoveManually: Interceptable<boolean, MinionCard>;

  shouldSwitchInitiativeAfterMovingManually: Interceptable<boolean, MinionCard>;
  shouldSwitchInitiativeAfterattacking: Interceptable<boolean, { target: AttackTarget }>;
  speed: Interceptable<CardSpeed, MinionCard>;
};
type MinionCardInterceptorName = keyof MinionCardInterceptors;

export class MinionCard extends Card<
  SerializedCard,
  MinionCardInterceptors,
  MinionBlueprint
> {
  private damageTaken = 0;

  readonly abilityTargets = new Map<string, Target[]>();

  readonly abilities: Ability<MinionCard>[] = [];

  readonly damageTracker: DamageTrackerComponent;

  private hasMovedThisTurn = false;

  constructor(game: Game, player: Player, options: CardOptions<MinionBlueprint>) {
    super(
      game,
      player,
      {
        ...makeCardInterceptors(),
        canPlay: new Interceptable(),
        canAttack: new Interceptable(),
        canBeAttacked: new Interceptable(),
        canRetaliate: new Interceptable(),
        canBeRetaliatedAgainst: new Interceptable(),
        hasSummoningSickness: new Interceptable(),
        canUseAbility: new Interceptable(),
        canBeTargeted: new Interceptable(),
        receivedDamage: new Interceptable(),
        maxHp: new Interceptable(),
        atk: new Interceptable(),
        dealsDamageFirst: new Interceptable(),
        canMove: new Interceptable(),
        canMoveManually: new Interceptable(),
        shouldSwitchInitiativeAfterMovingManually: new Interceptable(),
        shouldSwitchInitiativeAfterattacking: new Interceptable(),
        speed: new Interceptable()
      },
      options
    );

    this.blueprint.abilities.forEach(ability => {
      this.abilities.push(new Ability<MinionCard>(this.game, this, ability));
    });

    this.damageTracker = new DamageTrackerComponent(game, this);

    this.game.on(GAME_EVENTS.TURN_END, async () => {
      this.hasMovedThisTurn = false;
    });
  }

  get hasSummoningSickness(): boolean {
    return this.interceptors.hasSummoningSickness.getValue(true, this);
  }

  get isAlive() {
    return (
      this.remainingHp > 0 &&
      (this.location === CARD_LOCATIONS.BATTLEFIELD ||
        this.location === CARD_LOCATIONS.BASE)
    );
  }

  get atk(): number {
    return this.interceptors.atk.getValue(this.blueprint.atk, this);
  }

  get maxHp(): number {
    return this.interceptors.maxHp.getValue(this.blueprint.maxHp, this);
  }

  get jobs() {
    return this.blueprint.jobs;
  }

  get speed(): CardSpeed {
    return this.interceptors.speed.getValue(this.blueprint.speed, this);
  }

  get remainingHp(): number {
    return Math.max(this.maxHp - this.damageTaken, 0);
  }

  get isAttacking() {
    const phaseCtx = this.game.gamePhaseSystem.getContext();
    return phaseCtx.state === GAME_PHASES.COMBAT && phaseCtx.ctx.attacker?.equals(this);
  }

  get isAttackTarget() {
    const phaseCtx = this.game.gamePhaseSystem.getContext();
    return phaseCtx.state === GAME_PHASES.COMBAT && phaseCtx.ctx.defender?.equals(this);
  }

  protected async onInterceptorAdded(key: MinionCardInterceptorName) {
    if (key === 'maxHp') {
      await this.checkHp(this);
    }
  }

  protected async onInterceptorRemoved(key: MinionCardInterceptorName) {
    if (key === 'maxHp') {
      await this.checkHp(this);
    }
  }

  resetDamageTaken() {
    this.damageTaken = 0;
  }

  removeFromCurrentLocation(): void {
    super.removeFromCurrentLocation();
    this.damageTaken = 0;
  }

  canBeTargeted(source: AnyCard) {
    return this.interceptors.canBeTargeted.getValue(true, {
      source
    });
  }

  canAttack(target: AttackTarget) {
    const base = !this._isExhausted && this.atk > 0 && target.canBeAttacked(this);

    return this.interceptors.canAttack.getValue(base, {
      target
    });
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
      this.atk > 0 && !!phaseCtx.ctx.attacker?.canBeRetaliatedBy(this),
      {
        attacker: target
      }
    );
  }

  get dealsDamageFirst(): boolean {
    return this.interceptors.dealsDamageFirst.getValue(false, this);
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

  canUseAbility(id: string) {
    const ability = this.abilities.find(ability => ability.abilityId === id);
    if (!ability) return false;

    return this.interceptors.canUseAbility.getValue(ability.canUse, {
      card: this,
      ability
    });
  }

  getReceivedDamage(damage: Damage) {
    return this.interceptors.receivedDamage.getValue(damage.baseAmount, {
      damage
    });
  }

  private async checkHp(source: AnyCard) {
    if (this.remainingHp <= 0) {
      await this.destroy(source);
    }
  }

  shouldSwitchInitiativeAfterAttacking(attackTarget: AttackTarget): boolean {
    return this.interceptors.shouldSwitchInitiativeAfterattacking.getValue(true, {
      target: attackTarget
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
    await this.game.emit(
      CARD_EVENTS.CARD_BEFORE_TAKE_DAMAGE,
      new CardBeforeTakeDamageEvent({
        card: this,
        source,
        damage,
        amount: damage.getFinalAmount(this)
      })
    );

    this.damageTaken = Math.min(
      this.damageTaken + damage.getFinalAmount(this),
      this.maxHp
    );
    await this.game.emit(
      CARD_EVENTS.CARD_AFTER_TAKE_DAMAGE,
      new CardAfterTakeDamageEvent({
        card: this,
        source,
        damage,
        amount: damage.getFinalAmount(this),
        isFatal: this.remainingHp <= 0
      })
    );
    await this.checkHp(source);
  }

  async heal(heal: number) {
    await this.game.emit(
      MINION_EVENTS.MINION_BEFORE_HEAL,
      new MinionCardHealEvent({ card: this, amount: heal })
    );
    this.damageTaken = Math.max(this.damageTaken - heal, 0);
    await this.game.emit(
      MINION_EVENTS.MINION_AFTER_HEAL,
      new MinionCardHealEvent({ card: this, amount: heal })
    );
  }

  addAbility(ability: AbilityBlueprint<MinionCard, Target>) {
    const newAbility = new Ability<MinionCard>(this.game, this, ability);
    this.abilities.push(newAbility);
    return newAbility;
  }

  removeAbility(abilityId: string) {
    const index = this.abilities.findIndex(a => a.abilityId === abilityId);
    if (index === -1) return;
    this.abilities.splice(index, 1);
  }

  get canMove(): boolean {
    return this.interceptors.canMove.getValue(
      this.game.gamePhaseSystem.getContext().state === GAME_PHASES.MAIN &&
        !this.hasMovedThisTurn &&
        (this.location === CARD_LOCATIONS.BATTLEFIELD ||
          this.location === CARD_LOCATIONS.BASE),
      this
    );
  }

  get isOnBoard() {
    return (
      this.location === CARD_LOCATIONS.BATTLEFIELD ||
      this.location === CARD_LOCATIONS.BASE
    );
  }

  get canMoveManually(): boolean {
    return this.interceptors.canMoveManually.getValue(
      (this.canMove && this.location === CARD_LOCATIONS.BATTLEFIELD) ||
        this.location === CARD_LOCATIONS.BASE,
      this
    );
  }

  get shouldSwitchInitiativeAfterMovingManually(): boolean {
    return this.interceptors.shouldSwitchInitiativeAfterMovingManually.getValue(
      true,
      this
    );
  }

  async moveManually(index: number) {
    await this.move(index);
    this.hasMovedThisTurn = true;
    if (this.shouldSwitchInitiativeAfterMovingManually) {
      await this.game.turnSystem.switchInitiative();
    }
  }

  async move(index: number) {
    if (!this.canMove) return;
    if (!this.isOnBoard) return;

    await this.player.boardSide.moveCard(this.id, index);
    this.hasMovedThisTurn = true;
  }

  private async summon(position: BoardSpace<MinionCard>) {
    this.player.boardSide.placeCardInBase(this, position.index);
    if (this.hasSummoningSickness) {
      await (this as MinionCard).modifiers.add(
        new SummoningSicknessModifier(this.game, this)
      );
    }
    await this.blueprint.onPlay(this.game, this);

    await this.game.emit(
      MINION_EVENTS.MINION_SUMMONED,
      new MinionSummonedEvent({ card: this, position })
    );
  }

  get canPlayDuringCombatPhase(): boolean {
    return this.speed === CARD_SPEED.FAST;
  }

  get isCorrectPhaseToPlay() {
    const validPhases: string[] = this.canPlayDuringCombatPhase
      ? [GAME_PHASES.MAIN, GAME_PHASES.COMBAT]
      : [GAME_PHASES.MAIN];
    return validPhases.includes(this.game.gamePhaseSystem.getContext().state);
  }

  canPlay() {
    return this.interceptors.canPlay.getValue(
      this.canPayManaCost &&
        this.hasUnlockedAffinity &&
        this.isCorrectPhaseToPlay &&
        this.blueprint.canPlay(this.game, this),
      this
    );
  }

  async playAt(position: BoardSpace<MinionCard>) {
    await this.game.emit(
      CARD_EVENTS.CARD_BEFORE_PLAY,
      new CardBeforePlayEvent({ card: this })
    );
    await this.summon(position);
    await this.game.emit(
      CARD_EVENTS.CARD_AFTER_PLAY,
      new CardBeforePlayEvent({ card: this })
    );
  }

  // immediately plays the minion regardless of current chain or interaction state
  // this is useful when summoning minions as part of another card effect
  playImmediatelyAt(position: BoardSpace<MinionCard>) {
    return this.resolve(() => this.summon(position));
  }

  get potentialSummonPositions() {
    return this.player.boardSide.base.filter(space => space.isEmpty);
  }

  private async selectPosition() {
    const result = await this.game.interaction.selectSpacesOnBoard({
      source: this,
      player: this.player,
      canCancel: true,
      getLabel: () => 'Select position to summon',
      isElligible: space => {
        return this.potentialSummonPositions.includes(space as any);
      },
      canCommit(selectedSpaces) {
        return selectedSpaces.length === 1;
      },
      isDone(selectedSpaces) {
        return selectedSpaces.length === 1;
      },
      timeoutFallback: [this.potentialSummonPositions[0]]
    });

    return result;
  }

  async play() {
    await this.game.emit(
      CARD_EVENTS.CARD_DECLARE_PLAY,
      new CardPlayEvent({ card: this })
    );

    const positionResult = await this.selectPosition();
    if (positionResult.cancelled)
      return {
        cancelled: true
      };

    await this.playAt(positionResult.result[0] as BoardSpace<MinionCard>);

    return { cancelled: false };
  }

  get potentialAttackTargets(): Array<MinionCard | HeroCard> {
    if (this.location !== CARD_LOCATIONS.BATTLEFIELD) return [];

    return [
      this.player.opponent.hero,
      ...this.player.opponent.minionsInBattlefield
    ].filter(minion => this.canAttack(minion));
  }

  get potentialMoveTargets(): BoardSpace<AnyCard>[] {
    return this.canMove
      ? [
          ...(this.location === CARD_LOCATIONS.BATTLEFIELD
            ? this.player.boardSide.base
            : this.player.boardSide.battlefield
          ).filter(space => space.isEmpty)
        ]
      : [];
  }

  serialize(): SerializedMinionCard {
    return {
      ...this.serializeBase(),
      manaCost: this.manaCost,
      baseManaCost: this.manaCost,
      potentialAttackTargets: this.potentialAttackTargets.map(target => target.id),
      potentialMoveTargets: this.potentialMoveTargets.map(space => space.id),
      atk: this.atk,
      baseAtk: this.blueprint.atk,
      maxHp: this.maxHp,
      baseMaxHp: this.blueprint.maxHp,
      remainingHp: this.remainingHp,
      abilities: this.abilities.map(ability => ability.id),
      canMove: this.canMoveManually,
      jobs: this.jobs.map(job => job.id) as JobId[],
      hasSummoningSickness: this.hasSummoningSickness,
      speed: this.speed
    };
  }
}
