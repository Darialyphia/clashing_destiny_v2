import type { Values } from '@game/shared';
import type { Attacker, AttackTarget } from '../game/phases/combat.phase';

export const DAMAGE_TYPES = {
  COMBAT: 'COMBAT',
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

  private _isPrevented = false;

  constructor(options: DamageOptions) {
    this._baseAmount = options.baseAmount;
    this.type = options.type;
  }

  get baseAmount() {
    return this._baseAmount;
  }

  prevent() {
    this._isPrevented = true;
  }

  getFinalAmount(target: AttackTarget): number {
    if (this._isPrevented) return 0;
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
  constructor(amount: number) {
    super({ baseAmount: amount, type: DAMAGE_TYPES.SPELL });
  }
}

export class AbilityDamage extends Damage {
  constructor(amount: number) {
    super({ baseAmount: amount, type: DAMAGE_TYPES.ABILITY });
  }
}
