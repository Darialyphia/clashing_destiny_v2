import { isDefined } from '@game/shared';
import type { AnyCard } from '../card/entities/card.entity';
import type { Game } from '../game/game';
import { Player } from '../player/player.entity';
import {
  UnitAttackEvent,
  UnitDealDamageEvent,
  UnitReceiveDamageEvent
} from '../unit/unit-events';
import { Unit } from '../unit/unit.entity';
import { UNIT_EVENTS } from '../unit/unit.enums';
import { type Damage, CombatDamage } from '../utils/damage';

export class CombatComponent {
  private _attacksThisTurn: Array<{ target: Unit | Player; damage: Damage }> = [];
  private _counterAttacksThisTurn: Array<{ target: Unit; damage: Damage }> = [];

  constructor(
    private game: Game,
    private unit: Unit
  ) {}

  get attacks() {
    return this._attacksThisTurn;
  }

  get counterAttacks() {
    return this._counterAttacksThisTurn;
  }

  get attacksCount() {
    return this._attacksThisTurn.length;
  }

  get counterAttacksCount() {
    return this._counterAttacksThisTurn.length;
  }

  reset() {
    this._attacksThisTurn = [];
    this._counterAttacksThisTurn = [];
  }

  async counterAttack(attacker: Unit) {
    await this.game.emit(
      UNIT_EVENTS.UNIT_BEFORE_COUNTERATTACK,
      new UnitAttackEvent({
        targetType: 'unit',
        target: attacker,
        unit: this.unit
      })
    );
    const targets = this.unit.counterattackAOEShape
      .getArea([attacker])
      .map(point => this.game.unitSystem.getUnitAt(point))
      .filter(isDefined);

    const damage = new CombatDamage(this.unit, 'counterattack');

    await this.dealDamage(targets, damage);
    this._counterAttacksThisTurn.push({ target: attacker, damage });

    await this.game.emit(
      UNIT_EVENTS.UNIT_AFTER_COUNTERATTACK,
      new UnitAttackEvent({
        targetType: 'unit',
        target: attacker,
        unit: this.unit
      })
    );
  }

  async attack(target: Unit | Player) {
    const position = target instanceof Unit ? target.position.clone() : null;

    await this.game.emit(
      UNIT_EVENTS.UNIT_BEFORE_ATTACK,
      new UnitAttackEvent({
        targetType: target instanceof Unit ? 'unit' : 'player',
        target,
        unit: this.unit
      })
    );
    // if target is unit, we want to get the actual target on the board in case it moved since the attack was declared (ex: provoke)
    const actualTarget =
      target instanceof Unit ? this.game.unitSystem.getUnitAt(position!) : target;
    if (!actualTarget) return; // means target died or was removed from board since attack was declared

    const targets =
      actualTarget instanceof Unit
        ? this.game.unitSystem.getUnitsInAOE(
            this.unit.attackAOEShape,
            [actualTarget],
            this.unit.player
          )
        : [actualTarget];
    const damage = new CombatDamage(this.unit, 'attack');
    await this.dealDamage(targets, damage);
    this._attacksThisTurn.push({ target, damage });

    if (actualTarget instanceof Player) {
      await this.game.emit(
        UNIT_EVENTS.UNIT_AFTER_ATTACK,
        new UnitAttackEvent({
          targetType: 'player',
          target: actualTarget,
          unit: this.unit
        })
      );
      return;
    }

    const unit = this.game.unitSystem.getUnitAt(actualTarget)!;
    if (!unit) return;

    if (this.unit.dealsDamageFirstWhenAttacking && !unit.isAlive) {
      return;
    }

    // we check counterattack before emitting AFTER_ATTACK event to enable effects that would prevent counter attack for one attack only
    // ex: Fearsome
    const counterAttackParticipants = this.unit
      .getCounterattackParticipants(unit)
      .filter(unit => {
        return unit.canCounterAttack(this.unit) && this.unit.canBeCounterattackedBy(unit);
      });

    await this.game.emit(
      UNIT_EVENTS.UNIT_AFTER_ATTACK,
      new UnitAttackEvent({
        targetType: 'unit',
        target,
        unit: this.unit
      })
    );

    for (const unit of counterAttackParticipants) {
      await unit.counterAttack(this.unit);
    }
  }

  async dealDamage(targets: Array<Unit | Player>, damage: Damage) {
    await this.game.emit(
      UNIT_EVENTS.UNIT_BEFORE_DEAL_DAMAGE,
      new UnitDealDamageEvent({ targets, damage, unit: this.unit })
    );
    for (const target of targets) {
      await target.takeDamage(this.unit.card, damage);
    }
    await this.game.emit(
      UNIT_EVENTS.UNIT_AFTER_DEAL_DAMAGE,
      new UnitDealDamageEvent({ targets, damage, unit: this.unit })
    );
  }

  async takeDamage(from: AnyCard, damage: Damage, silent = false) {
    if (!silent) {
      await this.game.emit(
        UNIT_EVENTS.UNIT_BEFORE_RECEIVE_DAMAGE,
        new UnitReceiveDamageEvent({
          from,
          unit: this.unit,
          damage
        })
      );
    }

    await this.unit.removeHp(damage.getFinalAmount(this.unit), from);

    if (!silent) {
      await this.game.emit(
        UNIT_EVENTS.UNIT_AFTER_RECEIVE_DAMAGE,
        new UnitReceiveDamageEvent({
          from,
          unit: this.unit,
          damage
        })
      );
    }
  }
}
