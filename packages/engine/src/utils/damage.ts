import type { Values } from '@game/shared';
import { Unit } from '../unit/unit.entity';
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

  protected _isPrevented = false;

  constructor(options: DamageOptions) {
    this._baseAmount = options.baseAmount;
    this.type = options.type;
    this.source = options.source;
  }

  get baseAmount() {
    return this._baseAmount;
  }

  getFinalAmount(target: Unit | Player): number {
    if (this._isPrevented) return 0;

    return target.getReceivedDamage(this, this.source);
  }
}

export class CombatDamage extends Damage {
  private _attacker: Unit | Player;
  private _checkedTarget: Unit | null = null;

  constructor(
    attacker: Unit | Player,
    public kind: 'attack' | 'counterattack'
  ) {
    super({
      baseAmount: attacker.atk,
      type: DAMAGE_TYPES.COMBAT,
      source: attacker instanceof Unit ? attacker.card : attacker.hero
    });
    this._attacker = attacker;
  }

  get attacker() {
    return this._attacker;
  }

  prevent() {
    this._isPrevented = true;
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
    if (this._isPrevented) return 0;

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

  getFinalAmount(target: Unit | Player): number {
    const finalAmount = super.getFinalAmount(target);
    if (this._isPrevented) return 0;
    return finalAmount + this.source.player.hero.spellDamageBonus;
  }
}

export class AbilityDamage extends Damage {
  constructor(source: AnyCard, amount: number) {
    super({ baseAmount: amount, type: DAMAGE_TYPES.ABILITY, source });
  }
}
