import type { Game } from '../../game/game';
import type { Player } from '../../player/player.entity';
import { CombatDamage, type Damage } from '../../utils/damage';
import { Interceptable } from '../../utils/interceptable';
import { type AbilityBlueprint, type MinionBlueprint } from '../card-blueprint';
import {
  CARD_EVENTS,
  CARD_LOCATIONS,
  type CardLocation,
  type JobId
} from '../card.enums';
import {
  CardAfterDealCombatDamageEvent,
  CardAfterTakeDamageEvent,
  CardBeforeDealCombatDamageEvent,
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
import { COMBAT_STEPS, GAME_PHASES } from '../../game/game.enums';
import { Ability } from './ability.entity';
import {
  MINION_EVENTS,
  MinionCardHealEvent,
  MinionSummonedEvent
} from '../events/minion.events';
import { DamageTrackerComponent } from '../components/damage-tracker.component';
import type { BoardRow, BoardSpace } from '../../board/board-space.entity';
import type { Attacker, AttackTarget } from '../../game/systems/combat.system';
import { AbilityManagerComponent } from '../components/abilities-manager.component';
import { GAME_EVENTS } from '../../game/game.events';
import { PointAOEShape } from '../../aoe/point.aoe-shape';
import { AOE_TARGETING_TYPE } from '../../aoe/aoe-shape';
import { match } from 'ts-pattern';
import { isHero } from '../card-utils';
import type { BetterExtract } from '@game/shared';

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
  commandment: number;
  baseCommandment: number;
  abilities: string[];
  canMove: boolean;
  jobs: JobId[];
  hasSummoningSickness: boolean;
  canRetaliate: boolean;
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
  commandment: Interceptable<number, MinionCard>;
  canMove: Interceptable<boolean, MinionCard>;
  canMoveManually: Interceptable<boolean, MinionCard>;
  canMoveBetweenBattlefields: Interceptable<boolean, MinionCard>;

  shouldDealDamageFirst: Interceptable<boolean, MinionCard>;
  shouldSwitchInitiativeAfterMovingManually: Interceptable<boolean, MinionCard>;
  shouldSwitchInitiativeAfterAttacking: Interceptable<boolean, { target: AttackTarget }>;
  shouldCreateChainOnAttack: Interceptable<boolean, { target: AttackTarget }>;
  shouldGiveBountyWhenDestroyed: Interceptable<boolean, { source: AnyCard }>;
};
type MinionCardInterceptorName = keyof MinionCardInterceptors;

export class MinionCard extends Card<
  SerializedCard,
  MinionCardInterceptors,
  MinionBlueprint
> {
  private hasMovedManuallyThisTurn = false;

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
        commandment: new Interceptable(),
        canMove: new Interceptable(),
        canMoveManually: new Interceptable(),
        canMoveBetweenBattlefields: new Interceptable(),
        shouldSwitchInitiativeAfterMovingManually: new Interceptable(),
        shouldSwitchInitiativeAfterAttacking: new Interceptable(),
        shouldCreateChainOnAttack: new Interceptable(),
        shouldGiveBountyWhenDestroyed: new Interceptable(),
        shouldDealDamageFirst: new Interceptable(),
        speed: new Interceptable()
      },
      options
    );

    this.damageTracker = new DamageTrackerComponent(game, this);
    this.abilityManager = new AbilityManagerComponent<MinionCard>(game, this);
    this.game.on(GAME_EVENTS.TURN_START, () => {
      this.hasMovedManuallyThisTurn = false;
    });
  }

  isValidMovementPosition(space: BoardSpace): boolean {
    return space.isEmpty;
  }

  get hasSummoningSickness(): boolean {
    return this.interceptors.hasSummoningSickness.getValue(true, this);
  }

  get isOnBattlefield() {
    return (
      this.location === CARD_LOCATIONS.LEFT_BATTLEFIELD ||
      this.location === CARD_LOCATIONS.RIGHT_BATTLEFIELD
    );
  }

  get isOnBoard() {
    return this.location === CARD_LOCATIONS.BASE || this.isOnBattlefield;
  }

  get isAlive() {
    return this.remainingHp > 0 && this.isOnBoard;
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

  get remainingHp(): number {
    return Math.max(this.maxHp - this.damageTracker.damageTaken, 0);
  }

  get isAttacking() {
    return !!this.game.combatSystem.attacker?.equals(this);
  }

  get isAttackTarget() {
    return !!this.game.combatSystem.defender?.equals(this);
  }

  get canResolveCombat() {
    return this.isOnBattlefield && (this.isAttacking || this.isAttackTarget);
  }

  get shouldDealDamageFirst(): boolean {
    return this.interceptors.shouldDealDamageFirst.getValue(false, this);
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

  get commandment(): number {
    return this.interceptors.commandment.getValue(this.blueprint.commandment, this);
  }

  canBeTargeted(source: AnyCard) {
    return this.interceptors.canBeTargeted.getValue(true, {
      source
    });
  }

  get canAttackEnemyHero(): boolean {
    if (!this.isOnBattlefield) return false;
    const location = this.location as BetterExtract<
      CardLocation,
      'left_battlefield' | 'right_battlefield'
    >;
    const blockers = (
      location === CARD_LOCATIONS.LEFT_BATTLEFIELD
        ? this.player.opponent.minionsInLeftBattlefield
        : this.player.opponent.minionsInRightBattlefield
    ).filter(minion => !minion.isExhausted);

    return blockers.length === 0;
  }

  canAttack(target: AttackTarget) {
    let base = this.isOnBattlefield && !this._isExhausted && target.canBeAttacked(this);

    if (isHero(target) && !this.canAttackEnemyHero) {
      base = false;
    }

    return this.interceptors.canAttack.getValue(base, {
      target
    });
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
    if (this.game.combatSystem.isDefenderRetaliating) return false;
    if (this.game.combatSystem.state !== COMBAT_STEPS.REACTION) return false;

    return this.interceptors.canRetaliate.getValue(
      !!this.game.combatSystem.attacker?.canBeRetaliatedBy(this) && !this.isExhausted,
      {
        attacker: target
      }
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
    return this.interceptors.shouldSwitchInitiativeAfterAttacking.getValue(true, {
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
    // prevents the minion from taking damage and trigger events if it alreadydied during chain resolution
    if (!this.isAlive) return;

    await this.game.emit(
      CARD_EVENTS.CARD_BEFORE_TAKE_DAMAGE,
      new CardBeforeTakeDamageEvent({
        card: this,
        source,
        damage,
        amount: damage.getFinalAmount(this)
      })
    );

    this.damageTracker.takeDamage(damage.getFinalAmount(this));

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
    this.damageTracker.heal(heal);
    await this.game.emit(
      MINION_EVENTS.MINION_AFTER_HEAL,
      new MinionCardHealEvent({ card: this, amount: heal })
    );
  }

  get canMove(): boolean {
    return this.interceptors.canMove.getValue(
      this.game.gamePhaseSystem.getContext().state === GAME_PHASES.MAIN && this.isOnBoard,
      this
    );
  }

  get canMoveManually(): boolean {
    return this.interceptors.canMoveManually.getValue(
      this.canMove && !this.hasMovedManuallyThisTurn,
      this
    );
  }

  get shouldSwitchInitiativeAfterMovingManually(): boolean {
    return this.interceptors.shouldSwitchInitiativeAfterMovingManually.getValue(
      false,
      this
    );
  }

  getShouldCreateChainOnAttack(attackTarget: AttackTarget): boolean {
    return this.interceptors.shouldCreateChainOnAttack.getValue(true, {
      target: attackTarget
    });
  }

  async moveManually(zone: BoardRow, index: number) {
    await this.move(zone, index);
    this.hasMovedManuallyThisTurn = true;
    if (this.shouldSwitchInitiativeAfterMovingManually) {
      await this.game.turnSystem.switchInitiative();
    }
  }

  async move(zone: BoardRow, index: number) {
    if (!this.canMove) return;
    if (!this.isOnBoard) return;

    await this.player.boardSide.moveCard(this.id, zone, index);
  }

  private async summon(position: BoardSpace) {
    position.placeCard(this);
    if (this.hasSummoningSickness) {
      await this.exhaust();
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

  get hasAvailablePosition() {
    return true;
  }

  canPlay() {
    return this.interceptors.canPlay.getValue(
      this.canPlayBase &&
        this.hasUnlockedAffinity &&
        this.isCorrectPhaseToPlay &&
        this.blueprint.canPlay(this.game, this),
      this
    );
  }

  async playAt(position: BoardSpace) {
    await this.resolve(async () => {
      await this.summon(position);
    });
  }

  // immediately plays the minion regardless of current chain or interaction state
  // doesnt trigger BEFORE_PLAY or AFTER_PLAY events
  // this is useful when summoning minions as part of another card effect
  async playImmediatelyAt(position: BoardSpace) {
    await this.summon(position);
    this.updatePlayedAt();
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
    if (positionResult.cancelled) {
      return { cancelled: true };
    }
    await this.playAt(positionResult.result[0] as BoardSpace);

    return { cancelled: false };
  }

  get potentialAttackTargets(): Array<AttackTarget> {
    if (!this.isOnBattlefield) return [];

    const result: AttackTarget[] = [];
    if (this.location === CARD_LOCATIONS.LEFT_BATTLEFIELD) {
      result.push(...this.player.opponent.minionsInLeftBattlefield);
    }
    if (this.location === CARD_LOCATIONS.RIGHT_BATTLEFIELD) {
      result.push(...this.player.opponent.minionsInRightBattlefield);
    }
    return result.filter(minion => this.canAttack(minion));
  }

  get canMoveBetweenBattlefields(): boolean {
    return this.interceptors.canMoveBetweenBattlefields.getValue(false, this);
  }

  get potentialMoveTargets(): BoardSpace[] {
    if (!this.canMove) return [];
    if (!this.isOnBoard) return [];
    return match(this.position!.position.zone)
      .with(CARD_LOCATIONS.BASE, () =>
        [
          ...this.player.boardSide.leftBattlefield.spaces,
          ...this.player.boardSide.rightBattlefield.spaces
        ].filter(space => space.isEmpty)
      )
      .with(CARD_LOCATIONS.LEFT_BATTLEFIELD, () =>
        this.canMoveBetweenBattlefields
          ? [
              ...this.player.boardSide.base.filter(space => space.isEmpty),
              ...this.player.boardSide.rightBattlefield.spaces.filter(
                space => space.isEmpty
              )
            ]
          : this.player.boardSide.base.filter(space => space.isEmpty)
      )
      .with(CARD_LOCATIONS.RIGHT_BATTLEFIELD, () =>
        this.canMoveBetweenBattlefields
          ? [
              ...this.player.boardSide.base.filter(space => space.isEmpty),
              ...this.player.boardSide.leftBattlefield.spaces.filter(
                space => space.isEmpty
              )
            ]
          : this.player.boardSide.base.filter(space => space.isEmpty)
      )
      .exhaustive();
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
      commandment: this.commandment,
      baseCommandment: this.blueprint.commandment,
      abilities: this.abilityManager.serialize(),
      canMove: this.canMoveManually,
      jobs: this.jobs.map(job => job.id) as JobId[],
      hasSummoningSickness: this.hasSummoningSickness,
      canRetaliate: this.canRetaliate(this.game.combatSystem.attacker!)
    };
  }
}
