import type { AnyCard } from '../card/entities/card.entity';
import type { Player } from '../player/player.entity';
import type { Unit } from '../unit/unit.entity';
import type { Damage } from '../utils/damage';
import { TypedSerializableEvent } from '../utils/typed-emitter';

export const COMBAT_EVENTS = {
  COMBAT_BEFORE_ATTACK: 'combat.before_attack',
  COMBAT_AFTER_ATTACK: 'combat.after_attack',
  COMBAT_BEFORE_COUNTERATTACK: 'combat.before_counterattack',
  COMBAT_AFTER_COUNTERATTACK: 'combat.after_counterattack',
  COMBAT_BEFORE_DEAL_DAMAGE: 'combat.before_deal_damage',
  COMBAT_AFTER_DEAL_DAMAGE: 'combat.after_deal_damage',
  COMBAT_BEFORE_RECEIVE_DAMAGE: 'combat.before_receive_damage',
  COMBAT_AFTER_RECEIVE_DAMAGE: 'combat.after_receive_damage',
  COMBAT_DONE: 'combat.done'
} as const;

type Combatant = Unit | Player;

export class CombatAttackEvent extends TypedSerializableEvent<
  { attacker: Combatant; targetType: 'unit' | 'player'; target: Combatant },
  { attacker: string; targetType: 'unit' | 'player'; target: string }
> {
  serialize() {
    return {
      attacker: this.data.attacker.id,
      targetType: this.data.targetType,
      target: this.data.target.id
    };
  }

  get target() {
    return this.data.target;
  }
}

export class CombatDealDamageEvent extends TypedSerializableEvent<
  { attacker: Combatant; targets: Array<Combatant>; damage: Damage },
  { attacker: string; targets: Array<{ unit: string; damage: number }> }
> {
  serialize() {
    return {
      attacker: this.data.attacker.id,
      targets: this.data.targets.map(target => ({
        unit: target.id,
        damage: this.data.damage.getFinalAmount(target)
      }))
    };
  }
}

export class CombatTakeDamageEvent extends TypedSerializableEvent<
  { target: Combatant; from: AnyCard; damage: Damage },
  { target: string; from: string; damage: number }
> {
  serialize() {
    return {
      target: this.data.target.id,
      from: this.data.from.id,
      damage: this.data.damage.getFinalAmount(this.data.target)
    };
  }
}

export class CombatDoneEvent extends TypedSerializableEvent<
  { attacker: Combatant },
  { attacker: string }
> {
  serialize() {
    return {
      attacker: this.data.attacker.id
    };
  }
}

export type CombatEventMap = {
  [COMBAT_EVENTS.COMBAT_BEFORE_ATTACK]: CombatAttackEvent;
  [COMBAT_EVENTS.COMBAT_AFTER_ATTACK]: CombatAttackEvent;
  [COMBAT_EVENTS.COMBAT_BEFORE_COUNTERATTACK]: CombatAttackEvent;
  [COMBAT_EVENTS.COMBAT_AFTER_COUNTERATTACK]: CombatAttackEvent;
  [COMBAT_EVENTS.COMBAT_BEFORE_DEAL_DAMAGE]: CombatDealDamageEvent;
  [COMBAT_EVENTS.COMBAT_AFTER_DEAL_DAMAGE]: CombatDealDamageEvent;
  [COMBAT_EVENTS.COMBAT_BEFORE_RECEIVE_DAMAGE]: CombatTakeDamageEvent;
  [COMBAT_EVENTS.COMBAT_AFTER_RECEIVE_DAMAGE]: CombatTakeDamageEvent;
  [COMBAT_EVENTS.COMBAT_DONE]: CombatDoneEvent;
};
