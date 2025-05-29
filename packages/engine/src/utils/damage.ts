import type { BetterOmit, Values } from '@game/shared';
import type { AnyCard } from '../card/entities/card.entity';
import type { Attacker, AttackTarget } from '../game/phases/combat.phase';

export const DAMAGE_TYPES = {
  COMBAT: 'COMBAT',
  HERO_ATTACK: 'HERO_ATTACK',
  ABILITY: 'ABILITY',
  SPELL: 'SPELL'
} as const;

export type DamageType = Values<typeof DAMAGE_TYPES>;

export type DamageOptions = {
  baseAmount: number;
  type: DamageType;
};

export abstract class Damage {
  protected _baseAmount: number;

  readonly type: DamageType;

  constructor(options: DamageOptions) {
    this._baseAmount = options.baseAmount;
    this.type = options.type;
  }

  get baseAmount() {
    return this._baseAmount;
  }

  getFinalAmount(target: AttackTarget): number {
    return target.getReceivedDamage(this);
  }
}

export class CombatDamage extends Damage {
  private _attacker: Attacker;

  constructor(attacker: Attacker) {
    super({ baseAmount: attacker.atk, type: DAMAGE_TYPES.COMBAT });
    this._attacker = attacker;
  }

  get attacker() {
    return this._attacker;
  }
}

export class SpellDamage extends Damage {
  constructor(options: BetterOmit<DamageOptions, 'type'>) {
    super({ ...options, type: DAMAGE_TYPES.SPELL });
  }
}

export class AbilityDamage extends Damage {
  constructor(options: BetterOmit<DamageOptions, 'type'>) {
    super({ ...options, type: DAMAGE_TYPES.ABILITY });
  }
}
