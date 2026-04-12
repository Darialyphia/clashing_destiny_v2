import { isDefined } from '@game/shared';
import type { AnyCard } from '../card/entities/card.entity';
import type { Game } from '../game/game';
import { Player } from '../player/player.entity';
import { Unit } from '../unit/unit.entity';
import { UNIT_EVENTS } from '../unit/unit.enums';
import { type Damage, CombatDamage } from '../utils/damage';
import {
  COMBAT_EVENTS,
  CombatAttackEvent,
  CombatDealDamageEvent,
  CombatTakeDamageEvent
} from './combat.events';

export class CombatComponent {
  private _attacksThisTurn: Array<{ target: Unit | Player; damage: Damage }> = [];
  private _counterAttacksThisTurn: Array<{ target: Unit | Player; damage: Damage }> = [];

  constructor(
    private game: Game,
    private combatant: Unit | Player
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

  get player() {
    return this.combatant instanceof Unit ? this.combatant.player : this.combatant;
  }

  get card() {
    return this.combatant instanceof Unit ? this.combatant.card : this.combatant.hero;
  }

  reset() {
    this._attacksThisTurn = [];
    this._counterAttacksThisTurn = [];
  }

  async counterAttack(attacker: Unit | Player) {
    await this.game.emit(
      COMBAT_EVENTS.COMBAT_BEFORE_COUNTERATTACK,
      new CombatAttackEvent({
        targetType: 'unit',
        target: attacker,
        attacker: this.combatant
      })
    );
    const targets =
      attacker instanceof Player
        ? [attacker]
        : this.combatant.counterattackAOEShape
            .getArea([attacker])
            .map(point => this.game.unitSystem.getUnitAt(point))
            .filter(isDefined);

    const damage = new CombatDamage(this.combatant, 'counterattack');

    await this.dealDamage(targets, damage);
    this._counterAttacksThisTurn.push({ target: attacker, damage });

    await this.game.emit(
      COMBAT_EVENTS.COMBAT_AFTER_COUNTERATTACK,
      new CombatAttackEvent({
        targetType: 'unit',
        target: attacker,
        attacker: this.combatant
      })
    );
  }

  async attack(target: Unit | Player) {
    const position = target instanceof Unit ? target.position.clone() : null;

    await this.game.emit(
      COMBAT_EVENTS.COMBAT_BEFORE_ATTACK,
      new CombatAttackEvent({
        targetType: target instanceof Unit ? 'unit' : 'player',
        target,
        attacker: this.combatant
      })
    );
    // if target is unit, we want to get the actual target on the board in case it moved since the attack was declared (ex: provoke)
    const actualTarget =
      target instanceof Unit ? this.game.unitSystem.getUnitAt(position!) : target;
    if (!actualTarget) return; // means target died or was removed from board since attack was declared

    const targets =
      actualTarget instanceof Unit
        ? this.game.unitSystem.getUnitsInAOE(
            this.combatant.attackAOEShape,
            [actualTarget],
            this.player
          )
        : [actualTarget];
    const damage = new CombatDamage(this.combatant, 'attack');
    await this.dealDamage(targets, damage);
    this._attacksThisTurn.push({ target, damage });

    if (actualTarget instanceof Player) {
      await this.game.emit(
        COMBAT_EVENTS.COMBAT_AFTER_ATTACK,
        new CombatAttackEvent({
          targetType: 'player',
          target: actualTarget,
          attacker: this.combatant
        })
      );
      return;
    }

    const unit = this.game.unitSystem.getUnitAt(actualTarget)!;
    if (!unit) return;

    if (this.combatant.dealsDamageFirstWhenAttacking && !unit.isAlive) {
      return;
    }

    // we check counterattack before emitting AFTER_ATTACK event to enable effects that would prevent counter attack for one attack only
    // ex: Fearsome
    const counterAttackParticipants = this.combatant
      .getCounterattackParticipants(unit)
      .filter(unit => {
        return (
          unit.canCounterAttack(this.combatant) &&
          this.combatant.canBeCounterattackedBy(unit)
        );
      });

    await this.game.emit(
      COMBAT_EVENTS.COMBAT_AFTER_ATTACK,
      new CombatAttackEvent({
        targetType: 'unit',
        target,
        attacker: this.combatant
      })
    );

    for (const unit of counterAttackParticipants) {
      await unit.counterAttack(this.combatant);
    }
  }

  async dealDamage(targets: Array<Unit | Player>, damage: Damage) {
    await this.game.emit(
      COMBAT_EVENTS.COMBAT_BEFORE_DEAL_DAMAGE,
      new CombatDealDamageEvent({ targets, damage, attacker: this.combatant })
    );
    for (const target of targets) {
      await target.takeDamage(this.card, damage);
    }
    await this.game.emit(
      COMBAT_EVENTS.COMBAT_AFTER_DEAL_DAMAGE,
      new CombatDealDamageEvent({ targets, damage, attacker: this.combatant })
    );
  }

  async takeDamage(from: AnyCard, damage: Damage, silent = false) {
    if (!silent) {
      await this.game.emit(
        COMBAT_EVENTS.COMBAT_BEFORE_RECEIVE_DAMAGE,
        new CombatTakeDamageEvent({
          from,
          target: this.combatant,
          damage
        })
      );
    }

    await this.combatant.removeHp(damage.getFinalAmount(this.combatant), from);

    if (!silent) {
      await this.game.emit(
        COMBAT_EVENTS.COMBAT_AFTER_RECEIVE_DAMAGE,
        new CombatTakeDamageEvent({
          from,
          target: this.combatant,
          damage
        })
      );
    }
  }
}
