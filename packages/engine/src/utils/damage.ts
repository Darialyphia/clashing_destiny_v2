import type { Values } from '@game/shared';
import type { Unit } from '../unit/unit.entity';
import type { AnyCard } from '../card/entities/card.entity';
import type { SpellCard } from '../card/entities/spell-card.entity';
import { match } from 'ts-pattern';
import type { Player } from '../player/player.entity';

export const DAMAGE_TYPES = {
  COMBAT: 'COMBAT',
  ABILITY: 'ABILITY',
  SPELL: 'SPELL'
} as const;

export type DamageType = Values<typeof DAMAGE_TYPES>;

export type DamageOptions = {
  baseAmount: number;
  type: DamageType;
  source: AnyCard;
};

export abstract class Damage {
  protected _baseAmount: number;

  readonly type: DamageType;

  readonly source: AnyCard;

  constructor(options: DamageOptions) {
    this._baseAmount = options.baseAmount;
    this.type = options.type;
    this.source = options.source;
  }

  get baseAmount() {
    return this._baseAmount;
  }

  getFinalAmount(target: Unit | Player): number {
    return target.getReceivedDamage(this, this.source);
  }
}

export class CombatDamage extends Damage {
  private _attacker: Unit;
  private _checkedTarget: Unit | null = null;

  constructor(
    attacker: Unit,
    public kind: 'attack' | 'counterattack'
  ) {
    super({ baseAmount: attacker.atk, type: DAMAGE_TYPES.COMBAT, source: attacker.card });
    this._attacker = attacker;
  }

  get attacker() {
    return this._attacker;
  }

  get baseAmount() {
    if (this._checkedTarget === null) {
      return this._baseAmount;
    } else {
      return match(this.kind)
        .with('attack', () => this._attacker.getAttackDamage(this._checkedTarget!))
        .with('counterattack', () =>
          this._attacker.getRetaliationDamage(this._checkedTarget!)
        )
        .exhaustive();
    }
  }

  getFinalAmount(target: Unit): number {
    this._checkedTarget = target;
    const amount = super.getFinalAmount(target);
    this._checkedTarget = null;
    return amount;
  }
}

export class SpellDamage extends Damage {
  constructor(source: SpellCard, amount: number) {
    super({ baseAmount: amount, type: DAMAGE_TYPES.SPELL, source });
  }
}

export class AbilityDamage extends Damage {
  constructor(source: AnyCard, amount: number) {
    super({ baseAmount: amount, type: DAMAGE_TYPES.ABILITY, source });
  }
}
