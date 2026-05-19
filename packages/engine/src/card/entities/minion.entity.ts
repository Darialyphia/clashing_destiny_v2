import type { Game } from '../../game/game';
import type { Player } from '../../player/player.entity';
import { CombatDamage, type Damage } from '../../utils/damage';
import { Interceptable } from '../../utils/interceptable';
import {
  type AbilityBlueprint,
  type MinionBlueprint,
  type Targets
} from '../card-blueprint';
import {
  CARD_EVENTS,
  CARD_LOCATIONS,
  CARD_SPEED,
  MINION_TYPES,
  type CardSpeed,
  type JobId,
  type MinionType
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
import type { BoardSpace } from '../../board/board-space.entity';
import type { Attacker, AttackTarget } from '../../game/systems/combat.system';
import { isMinion } from '../card-utils';
import type { SpaceTargetingStrategy } from '../../targeting/targeting-strategy';
import { RangedTargetingStrategy } from '../../targeting/ranged-targeting.strategy';
import { PointAOEShape } from '../../aoe/point.aoe-shape';
import { AOE_TARGETING_TYPE } from '../../aoe/aoe-shape';
import { match } from 'ts-pattern';
import { MeleeTargetingStrategy } from '../../targeting/melee-targeting.strategy';
import { AbilityManagerComponent } from '../components/abilities-manager.component';

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
  subKind: MinionType;
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

  attackTargetingPattern: Interceptable<SpaceTargetingStrategy>;
  retaliationTargetingPattern: Interceptable<SpaceTargetingStrategy>;

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

  readonly damageTracker: DamageTrackerComponent;

  readonly abilityManager: AbilityManagerComponent<MinionCard>;

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
        speed: new Interceptable(),
        attackTargetingPattern: new Interceptable(),
        retaliationTargetingPattern: new Interceptable()
      },
      options
    );

    this.damageTracker = new DamageTrackerComponent(game, this);
    this.abilityManager = new AbilityManagerComponent<MinionCard>(game, this);
  }

  isValidMovementPosition(space: BoardSpace): boolean {
    return space.isEmpty && this.isValidSpaceForsubKind(space);
  }

  get hasSummoningSickness(): boolean {
    return this.interceptors.hasSummoningSickness.getValue(true, this);
  }

  get subKind() {
    return this.blueprint.subKind;
  }

  get isAlive() {
    return this.remainingHp > 0 && this.location === CARD_LOCATIONS.BOARD;
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
    return this.game.combatSystem.attacker?.equals(this);
  }

  get isAttackTarget() {
    return this.game.combatSystem.defender?.equals(this);
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

  canAttack(target: MinionCard | HeroCard): boolean {
    const base = !this._isExhausted && this.atk > 0;

    return this.interceptors.canAttack.getValue(base, { target });
  }

  get defaultAttackTargettingPattern(): SpaceTargetingStrategy {
    return match(this.blueprint.subKind)
      .with(MINION_TYPES.MELEE, () => new MeleeTargetingStrategy(this.game, this))
      .with(MINION_TYPES.RANGED, () => new RangedTargetingStrategy(this.game, this))
      .with(MINION_TYPES.FLYER, () => new MeleeTargetingStrategy(this.game, this))
      .exhaustive();
  }
  get attackTargettingPattern(): SpaceTargetingStrategy {
    return this.interceptors.attackTargetingPattern.getValue(
      new MeleeTargetingStrategy(this.game, this),
      {}
    );
  }

  get retaliationTargettingPattern(): SpaceTargetingStrategy {
    return this.interceptors.retaliationTargetingPattern.getValue(
      new MeleeTargetingStrategy(this.game, this),
      {}
    );
  }

  canAttackAt(space: BoardSpace) {
    if (this.space?.equals(space)) {
      return false;
    }
    const target =
      space.occupant && isMinion(space.occupant)
        ? space.occupant
        : this.player.opponent.hero;
    const canBeAttacked =
      target instanceof MinionCard ? target.canBeAttacked(this) : this.isEnemy(target);

    if (!this.canAttack(target) || !canBeAttacked) {
      return false;
    }

    return this.attackTargettingPattern.canTargetAt(space);
  }

  canBeAttacked(attacker: Attacker) {
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
    if (!this.game.combatSystem.defender?.equals(this)) return false;

    return this.interceptors.canRetaliate.getValue(
      !!this.game.combatSystem.attacker?.canBeRetaliatedBy(this) &&
        this.retaliationTargettingPattern.canTargetAt(target.position.coordinates!),
      {
        attacker: target
      }
    );
  }

  get dealsDamageFirst(): boolean {
    return this.interceptors.dealsDamageFirst.getValue(false, this);
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

  addAbility(ability: AbilityBlueprint<MinionCard, any>) {
    return this.abilityManager.addAbility(ability);
  }

  removeAbility(abilityId: string) {
    this.abilityManager.removeAbility(abilityId);
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

  get canMove(): boolean {
    return this.interceptors.canMove.getValue(
      this.game.gamePhaseSystem.getContext().state === GAME_PHASES.MAIN &&
        this.location === CARD_LOCATIONS.BOARD,
      this
    );
  }

  get canMoveManually(): boolean {
    return this.interceptors.canMoveManually.getValue(
      this.canMove && this.location === CARD_LOCATIONS.BOARD,
      this
    );
  }

  get shouldSwitchInitiativeAfterMovingManually(): boolean {
    return this.interceptors.shouldSwitchInitiativeAfterMovingManually.getValue(
      true,
      this
    );
  }

  async moveManually(space: BoardSpace) {
    await this.move(space);
    if (this.shouldSwitchInitiativeAfterMovingManually) {
      await this.game.turnSystem.switchInitiative();
    }
  }

  async move(space: BoardSpace) {
    if (!this.canMove) return;

    await this.position.move(space);
  }

  private async summon(position: BoardSpace) {
    this.position.placeOnBoard(position);
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

  get isCorrectPhaseToPlay() {
    return this.game.gamePhaseSystem.getContext().state === GAME_PHASES.MAIN;
  }

  isValidSpaceForsubKind(cell: BoardSpace): boolean {
    if (!cell.player?.equals(this.player)) return false;

    return match(this.blueprint.subKind)
      .with(MINION_TYPES.MELEE, () => cell.isFrontRow)
      .with(MINION_TYPES.RANGED, () => cell.isBackRow)
      .with(MINION_TYPES.FLYER, () => true)
      .exhaustive();
  }

  get hasAvailablePosition() {
    return this.game.boardSystem
      .getSpacesForPlayer(this.player)
      .some(cell => this.isValidSpaceForsubKind(cell) && !cell.isOccupied);
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

  async playAt(position: BoardSpace) {
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
  playImmediatelyAt(position: BoardSpace) {
    return this.resolve(() => this.summon(position));
  }

  get potentialSummonPositions() {
    return this.game.boardSystem
      .getSpacesForPlayer(this.player)
      .filter(space => this.isValidSpaceForsubKind(space) && !space.isOccupied);
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
      timeoutFallback: [this.potentialSummonPositions[0]],
      getAOE: () =>
        new PointAOEShape(this.game, {
          targetingType: AOE_TARGETING_TYPE.EMPTY,
          player: this.player
        })
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

    await this.playAt(positionResult.result[0] as BoardSpace);

    return { cancelled: false };
  }

  get potentialAttackTargets(): Array<MinionCard | HeroCard> {
    if (this.location !== CARD_LOCATIONS.BOARD) return [];

    return [this.player.opponent.hero, ...this.player.enemyMinions].filter(minion =>
      this.canAttack(minion)
    );
  }

  get potentialMoveTargets(): BoardSpace[] {
    return this.canMove
      ? this.game.boardSystem
          .getSpacesForPlayer(this.player)
          .filter(space => this.position.canMoveTo(space))
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
      abilities: this.abilityManager.serialize(),
      canMove: this.canMoveManually,
      jobs: this.jobs.map(job => job.id) as JobId[],
      hasSummoningSickness: this.hasSummoningSickness,
      speed: this.speed,
      subKind: this.subKind
    };
  }
}
