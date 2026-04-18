import { isDefined, Vec2, type Point, type Serializable } from '@game/shared';
import type { MinionCard } from '../card/entities/minion-card.entity';
import type { Game } from '../game/game';
import { EntityWithModifiers } from '../utils/entity-with-modifiers';
import { MovementComponent } from './components/movement.component';
import { Interceptable } from '../utils/interceptable';
import type { AnyCard } from '../card/entities/card.entity';
import type { Modifier } from '../modifier/modifier.entity';
import { CARD_KINDS } from '../card/card.enums';
import {
  TARGETING_TYPE,
  type TargetingStrategy,
  type TargetingType
} from '../targeting/targeting-strategy';
import type { GenericAOEShape } from '../aoe/aoe-shape';
import { Player } from '../player/player.entity';
import type { Damage } from '../utils/damage';
import {
  SingleCounterAttackParticipantStrategy,
  type CounterAttackParticipantStrategy
} from './counterattack-participants';
import { UNIT_EVENTS } from './unit.enums';
import {
  UnitAfterBounceEvent,
  UnitAfterDestroyEvent,
  UnitAfterHealEvent,
  UnitAfterMoveEvent,
  UnitBeforeBounceEvent,
  UnitBeforeDestroyEvent,
  UnitBeforeHealEvent,
  UnitBeforeMoveEvent
} from './unit-events';
import { CombatComponent } from '../combat/combat.component';
import { COMBAT_EVENTS, CombatDoneEvent } from '../combat/combat.events';

export type UnitOptions = {
  id: string;
  position: Point;
};

export type SerializedUnit = {
  id: string;
  entityType: 'unit';
  card: string;
  position: Point;
  baseAtk: number;
  atk: number;
  baseRetaliation: number;
  retaliation: number;
  baseMaxHp: number;
  maxHp: number;
  currentHp: number;
  isFullHp: boolean;
  player: string;
  keywords: Array<{ id: string; name: string; description: string }>;
  isExhausted: boolean;
  isDead: boolean;
  modifiers: string[];
  canMove: boolean;
  attackableCells: string[];
  isBackRow: boolean;
  isFrontRow: boolean;
};

export type UnitInterceptors = {
  canMove: Interceptable<boolean>;
  canBeMoved: Interceptable<boolean>;
  canMoveAfterAttacking: Interceptable<boolean>;
  canAttack: Interceptable<boolean, { target: Unit | Player }>;
  canCounterAttack: Interceptable<boolean, { attacker: Unit | Player }>;
  canBeAttackTarget: Interceptable<boolean, { attacker: Unit | Player }>;
  canBeCounterattackTarget: Interceptable<boolean, { attacker: Unit | Player }>;
  canBeCardTarget: Interceptable<boolean, { card: AnyCard }>;
  canBeDestroyed: Interceptable<boolean>;
  canReceiveModifier: Interceptable<boolean, { modifier: Modifier<Unit> }>;

  maxHp: Interceptable<number>;
  atk: Interceptable<number>;
  retaliation: Interceptable<number>;

  dealsDamageFirstWhenAttacking: Interceptable<boolean>;

  attackTargetingPattern: Interceptable<TargetingStrategy>;
  attackTargetType: Interceptable<TargetingType>;
  attackAOEShape: Interceptable<GenericAOEShape>;
  attackCounterattackParticipants: Interceptable<CounterAttackParticipantStrategy>;

  counterattackTargetingPattern: Interceptable<TargetingStrategy>;
  counterattackTargetType: Interceptable<TargetingType>;
  counterattackAOEShape: Interceptable<GenericAOEShape>;

  maxAttacksPerTurn: Interceptable<number>;
  maxMovementsPerTurn: Interceptable<number>;

  player: Interceptable<Player>;

  damageDealt: Interceptable<number, { target: Unit | Player }>;
  damageReceived: Interceptable<
    number,
    { amount: number; source: AnyCard; damage: Damage }
  >;

  shouldActivateOnTurnStart: Interceptable<boolean>;
  shouldExhaustAfterMoving: Interceptable<boolean>;
  shouldSwitchInitiativeafterMoving: Interceptable<boolean>;
  shouldSwitchInitiativeafterAttacking: Interceptable<boolean>;
};

export class Unit
  extends EntityWithModifiers<UnitInterceptors>
  implements Serializable<SerializedUnit>
{
  readonly movement: MovementComponent;

  readonly combat: CombatComponent;

  private damageTaken = 0;

  _isExhausted = false;

  constructor(
    game: Game,
    readonly card: MinionCard,
    options: UnitOptions
  ) {
    super(options.id, game, {
      canMove: new Interceptable(),
      canBeMoved: new Interceptable(),
      canMoveAfterAttacking: new Interceptable(),
      canAttack: new Interceptable(),
      canCounterAttack: new Interceptable(),
      canBeAttackTarget: new Interceptable(),
      canBeCounterattackTarget: new Interceptable(),
      canBeCardTarget: new Interceptable(),
      canBeDestroyed: new Interceptable(),
      canReceiveModifier: new Interceptable(),

      maxHp: new Interceptable(),
      atk: new Interceptable(),
      retaliation: new Interceptable(),

      dealsDamageFirstWhenAttacking: new Interceptable(),

      attackTargetingPattern: new Interceptable(),
      attackTargetType: new Interceptable(),
      attackAOEShape: new Interceptable(),
      attackCounterattackParticipants: new Interceptable(),

      counterattackTargetingPattern: new Interceptable(),
      counterattackTargetType: new Interceptable(),
      counterattackAOEShape: new Interceptable(),

      maxAttacksPerTurn: new Interceptable(),
      maxMovementsPerTurn: new Interceptable(),

      player: new Interceptable(),

      damageDealt: new Interceptable(),
      damageReceived: new Interceptable(),

      shouldActivateOnTurnStart: new Interceptable<boolean>(),
      shouldExhaustAfterMoving: new Interceptable<boolean>(),
      shouldSwitchInitiativeafterMoving: new Interceptable<boolean>(),
      shouldSwitchInitiativeafterAttacking: new Interceptable<boolean>()
    });
    this.movement = new MovementComponent(game, this, {
      position: options.position
    });

    this.combat = new CombatComponent(game, this);
  }

  protected async onInterceptorAdded(key: string) {
    if (key === 'maxHp') {
      await this.checkHp({ source: this.card });
    }
  }

  get player() {
    return this.card.player!;
  }

  get isMinion() {
    return this.card.kind === CARD_KINDS.MINION;
  }

  get position() {
    return this.movement.position;
  }

  get x() {
    return this.position.x;
  }

  get y() {
    return this.position.y;
  }

  get shouldActivateOnTurnStart() {
    return this.interceptors.shouldActivateOnTurnStart.getValue(true, {});
  }

  get isAt() {
    return this.movement.isAt.bind(this.movement);
  }

  isEnemy(entity: Unit | Player) {
    if (entity instanceof Player) {
      return !this.player.equals(entity);
    }
    return !this.player.equals(entity.player);
  }

  isAlly(entity: Unit | Player) {
    return !this.isEnemy(entity);
  }

  get maxMovementsPerTurn() {
    return this.interceptors.maxMovementsPerTurn.getValue(
      this.game.config.MAX_MOVEMENT_PER_TURN,
      {}
    );
  }

  get maxAttacksPerTurn() {
    return this.interceptors.maxAttacksPerTurn.getValue(
      this.game.config.MAX_ATTACKS_PER_TURN,
      {}
    );
  }

  get attacksPerformedThisTurn() {
    return this.combat.attacksCount;
  }

  get counterAttacksPerformedThisTurn() {
    return this.combat.counterAttacksCount;
  }

  get movementsMadeThisTurn() {
    return this.movement.movementsCount;
  }

  get canMoveAfterAttacking() {
    return this.interceptors.canMoveAfterAttacking.getValue(false, {});
  }

  get canBeMoved() {
    return this.interceptors.canBeMoved.getValue(false, {});
  }

  get isAloneOnColumn() {
    const unitsOnRow = this.game.unitSystem.units.filter(
      unit => unit.position.x === this.x && !unit.equals(this) && unit.isAlly(this)
    );
    return unitsOnRow.length === 0;
  }

  get isOnBackRow() {
    return this.game.boardSystem.getCellAt(this.position)!.isBackRow;
  }

  get isOnFrontRow() {
    return this.game.boardSystem.getCellAt(this.position)!.isFrontRow;
  }

  get adjacentUnits() {
    return this.game.boardSystem
      .getCellAt(this.position)!
      .adjacent.map(cell => cell.unit)
      .filter(isDefined);
  }

  get unitsOnSameColumn() {
    return this.game.unitSystem.units.filter(
      unit => unit.position.x === this.x && !unit.equals(this)
    );
  }

  get enemiesOnSameColumn() {
    return this.unitsOnSameColumn.filter(unit => unit.isEnemy(this));
  }

  get alliesOnSameColumn() {
    return this.unitsOnSameColumn.filter(unit => unit.isAlly(this));
  }

  get left() {
    return this.game.boardSystem.getCellAt(this.position)!.left;
  }

  get right() {
    return this.game.boardSystem.getCellAt(this.position)!.right;
  }

  get inFront() {
    return this.game.boardSystem.getCellAt(this.position)!.inFront;
  }

  get behind() {
    return this.game.boardSystem.getCellAt(this.position)!.behind;
  }

  get unitsOnLeftColumn() {
    return this.game.unitSystem.units.filter(
      unit => unit.position.x === this.x - 1 && !unit.equals(this)
    );
  }

  get unitsOnRightColumn() {
    return this.game.unitSystem.units.filter(
      unit => unit.position.x === this.x + 1 && !unit.equals(this)
    );
  }

  get unitsOnSameRow() {
    return this.player.units.filter(
      unit => unit.position.y === this.y && !unit.equals(this)
    );
  }

  get canMove(): boolean {
    return this.interceptors.canMove.getValue(
      this.movementsMadeThisTurn < this.maxMovementsPerTurn && !this.isExhausted,
      {}
    );
  }

  canMoveTo(point: Point) {
    if (!this.canMove) return false;
    return this.movement.canMoveTo(point);
  }

  get shouldExhaustAfterMoving() {
    return this.interceptors.shouldExhaustAfterMoving.getValue(true, {});
  }

  get shouldSwitchInitiativeafterMoving() {
    return this.interceptors.shouldSwitchInitiativeafterMoving.getValue(true, {});
  }

  async move(to: Point) {
    await this.movement.move(to);
    if (this.shouldExhaustAfterMoving) {
      this.exhaust();
    }
    if (this.shouldSwitchInitiativeafterMoving) {
      await this.game.turnSystem.switchInitiative();
    }
  }

  async teleport(to: Point, silent = false) {
    // dont trigger events if moving from a source outside of the game (for example sandbox tools)
    if (!silent) {
      await this.game.emit(
        UNIT_EVENTS.UNIT_BEFORE_TELEPORT,
        new UnitBeforeMoveEvent({
          unit: this,
          position: Vec2.fromPoint(to)
        })
      );
    }
    const prevPosition = this.movement.position.clone();
    this.movement.position.x = to.x;
    this.movement.position.y = to.y;
    if (!silent) {
      await this.game.emit(
        UNIT_EVENTS.UNIT_AFTER_TELEPORT,
        new UnitAfterMoveEvent({
          unit: this,
          position: this.position,
          previousPosition: prevPosition
        })
      );
    }
  }

  async swapPositionWith(target: Unit) {
    const targetPosition = target.position.clone();
    await target.teleport(this.position);
    await this.teleport(targetPosition);
  }

  get canBeDestroyed(): boolean {
    return this.interceptors.canBeDestroyed.getValue(true, {});
  }

  canAttack(target: Unit | Player): boolean {
    return this.interceptors.canAttack.getValue(
      this.attacksPerformedThisTurn < this.maxAttacksPerTurn &&
        !this.isExhausted &&
        this.atk > 0,
      { target }
    );
  }

  canAttackAt(point: Point) {
    if (this.position.equals(point)) {
      return false;
    }
    const target = this.game.unitSystem.getUnitAt(point) ?? this.player.opponent;
    const canBeAttacked =
      target instanceof Unit ? target.canBeAttackedBy(this) : this.isEnemy(target);
    if (!this.canAttack(target) || !canBeAttacked) {
      return false;
    }

    const result = this.attackTargettingPattern.canTargetAt(point);
    return result;
  }

  get isExhausted() {
    return this._isExhausted;
  }

  canBeAttackedBy(attacker: Unit | Player): boolean {
    return this.interceptors.canBeAttackTarget.getValue(this.isAlive, {
      attacker: attacker
    });
  }

  canBeCounterattackedBy(attackTarget: Unit | Player): boolean {
    return this.interceptors.canBeCounterattackTarget.getValue(this.isAlive, {
      attacker: attackTarget
    });
  }

  canBeTargetedBy(card: AnyCard): boolean {
    return this.interceptors.canBeCardTarget.getValue(this.isAlive, { card });
  }

  get attackTargettingPattern(): TargetingStrategy {
    return this.interceptors.attackTargetingPattern.getValue(this.card.attackPattern, {});
  }

  get attackTargetType(): TargetingType {
    return this.interceptors.attackTargetType.getValue(TARGETING_TYPE.ENEMY_UNIT, {});
  }

  get attackAOEShape(): GenericAOEShape {
    return this.interceptors.attackAOEShape.getValue(this.card.attackAOEShape, {});
  }

  get counterattackTargetingPattern(): TargetingStrategy {
    return this.interceptors.counterattackTargetingPattern.getValue(
      this.card.counterattackPattern,
      {}
    );
  }

  get counterattackTargetType(): TargetingType {
    return this.interceptors.counterattackTargetType.getValue(
      TARGETING_TYPE.ENEMY_UNIT,
      {}
    );
  }

  get counterattackAOEShape(): GenericAOEShape {
    return this.interceptors.counterattackAOEShape.getValue(
      this.card.counterattackAOEShape,
      {}
    );
  }

  getCounterattackParticipants(initialTarget: Unit) {
    return this.interceptors.attackCounterattackParticipants
      .getValue(new SingleCounterAttackParticipantStrategy(), {})
      .getCounterattackParticipants({
        attacker: this,
        initialTarget,
        affectedUnits: this.attackAOEShape
          .getArea([initialTarget])
          .map(point => this.game.unitSystem.getUnitAt(point))
          .filter(isDefined)
      });
  }

  canCounterAttack(unit: Unit | Player): boolean {
    return this.interceptors.canCounterAttack.getValue(true, { attacker: unit });
  }

  canCounterAttackAt(point: Point) {
    if (this.position.equals(point)) {
      return false;
    }

    const target = this.game.unitSystem.getUnitAt(point);
    if (!target) return false;

    return (
      this.canCounterAttack(target) &&
      this.counterattackTargetingPattern.canTargetAt(point)
    );
  }

  get remainingHp() {
    return Math.max(this.maxHp - this.damageTaken, 0);
  }

  get isAlive() {
    return this.remainingHp > 0;
  }

  get nearbyUnits(): Unit[] {
    return this.game.unitSystem.getNearbyUnits(this.position);
  }

  getReceivedDamage(damage: Damage, source: AnyCard) {
    return this.interceptors.damageReceived.getValue(damage.baseAmount, {
      damage,
      amount: damage.baseAmount,
      source
    });
  }

  get dealsDamageFirstWhenAttacking() {
    return this.interceptors.dealsDamageFirstWhenAttacking.getValue(false, {});
  }

  getAttackDamage(target: Unit | Player) {
    return this.interceptors.damageDealt.getValue(this.atk, { target });
  }

  getRetaliationDamage(attacker: Unit | Player) {
    return this.interceptors.damageDealt.getValue(this.retaliation, { target: attacker });
  }

  get maxHp() {
    return this.interceptors.maxHp.getValue(this.card.maxHp, {});
  }

  get atk() {
    return this.interceptors.atk.getValue(this.card.atk, {});
  }

  get retaliation() {
    return this.interceptors.retaliation.getValue(this.card.retaliation, {});
  }

  get shouldSwitchInitiativeafterAttacking() {
    return this.interceptors.shouldSwitchInitiativeafterAttacking.getValue(true, {});
  }

  async attack(point: Point) {
    const target = this.game.unitSystem.getUnitAt(point) ?? this.player.opponent;
    await this.combat.attack(target);
    if (this.attacksPerformedThisTurn >= this.maxAttacksPerTurn) {
      this.exhaust();
    }
    await this.game.emit(
      COMBAT_EVENTS.COMBAT_DONE,
      new CombatDoneEvent({ attacker: this })
    );
    if (this.shouldSwitchInitiativeafterAttacking) {
      console.log('switching initiative after attack');
      await this.game.turnSystem.switchInitiative();
    }
  }

  async counterAttack(attacker: Unit | Player) {
    return this.combat.counterAttack(attacker);
  }

  get dealDamage() {
    return this.combat.dealDamage.bind(this.combat);
  }

  get takeDamage() {
    return this.combat.takeDamage.bind(this.combat);
  }

  async heal(source: AnyCard, amount: number) {
    await this.game.emit(
      UNIT_EVENTS.UNIT_BEFORE_HEAL,
      new UnitBeforeHealEvent({ unit: this, amount, source })
    );

    this.addHp(amount);

    await this.game.emit(
      UNIT_EVENTS.UNIT_AFTER_HEAL,
      new UnitAfterHealEvent({ unit: this, amount, source })
    );
  }

  addHp(amount: number) {
    this.damageTaken = Math.max(this.damageTaken - amount, 0);
  }

  async removeHp(amount: number, source: AnyCard) {
    this.damageTaken = Math.min(this.damageTaken + amount, this.maxHp);

    await this.checkHp({ source });
  }

  private async checkHp({ source }: { source: AnyCard }) {
    if (!this.isAlive) {
      await this.game.inputSystem.schedule(() => this.destroy(source));
    }
  }

  async removeFromBoard() {
    this.game.unitSystem.removeUnit(this);
  }

  async destroy(source: AnyCard, silent = false) {
    // we force the destruction if it is silent since this comes from sandbox tools
    if (!this.canBeDestroyed && !silent) return;

    if (!silent) {
      await this.game.emit(
        UNIT_EVENTS.UNIT_BEFORE_DESTROY,
        new UnitBeforeDestroyEvent({ source, unit: this })
      );
    }
    const position = this.position;

    await this.removeFromBoard();
    await this.card.sendToDiscardPile();

    if (!silent) {
      await this.game.emit(
        UNIT_EVENTS.UNIT_AFTER_DESTROY,
        new UnitAfterDestroyEvent({ source, destroyedAt: position, unit: this })
      );
    }
    // remove modifiers after the events to avoid removing OnDestroy modifiers
    for (const modifier of this.modifiers.list) {
      await this.modifiers.remove(modifier.id);
    }
  }

  exhaust() {
    this._isExhausted = true;
  }

  wakeUp() {
    this._isExhausted = false;
  }

  activate() {
    this.combat.reset();
    this.movement.resetMovementsCount();
    this.wakeUp();
  }

  async bounce(silent = false) {
    if (!silent) {
      await this.game.emit(
        UNIT_EVENTS.UNIT_BEFORE_BOUNCE,
        new UnitBeforeBounceEvent({
          unit: this
        })
      );
    }

    const canBounce = !this.player.cardManager.isHandFull;
    // we force the bounce if it is silent since this comes from sandbox tools
    if (canBounce || silent) {
      await this.player.cardManager.addToHand(this.card as MinionCard);
      await this.removeFromBoard();
      for (const modifier of this.modifiers.list) {
        await this.modifiers.remove(modifier.id);
      }
      if (!silent) {
        await this.game.emit(
          UNIT_EVENTS.UNIT_AFTER_BOUNCE,
          new UnitAfterBounceEvent({
            unit: this,
            didBounce: canBounce
          })
        );
      }
    } else {
      await this.destroy(this.card, silent);
    }
  }

  serialize() {
    return {
      id: this.id,
      entityType: 'unit' as const,
      card: this.card.id,
      position: this.position.serialize(),
      baseAtk: this.card.blueprint.atk,
      atk: this.atk,
      baseRetaliation: this.card.blueprint.retaliation,
      retaliation: this.retaliation,
      baseMaxHp: this.card.blueprint.maxHp,
      maxHp: this.maxHp,
      currentHp: this.remainingHp,
      isFullHp: this.remainingHp === this.maxHp,
      player: this.player.id,
      keywords: [],
      isExhausted: this.isExhausted,
      isDead: !this.isAlive,
      modifiers: this.modifiers.list.map(modifier => modifier.id),
      canMove: this.canMove,
      attackableCells: this.game.boardSystem.cells
        .filter(cell => this.canAttackAt(cell.position))
        .map(cell => cell.id),
      isBackRow: this.isOnBackRow,
      isFrontRow: this.isOnFrontRow
    };
  }
}
