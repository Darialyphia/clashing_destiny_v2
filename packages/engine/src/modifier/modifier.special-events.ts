import type { Values } from '@game/shared';
import { TypedSerializableEvent } from '../utils/typed-emitter';
import type { Unit } from '../unit/unit.entity';

export const MODIFIER_SPECIAL_EVENTS = {
  MODIFIER_BACKSTAB: 'modifier.backstab'
} as const;

export type ModifierSpecialEvents = Values<typeof MODIFIER_SPECIAL_EVENTS>;

export class BackstabEvent extends TypedSerializableEvent<
  {
    unit: Unit;
    target: Unit;
    amount: number;
  },
  {
    unit: string;
    target: string;
    amount: number;
  }
> {
  serialize(): { unit: string; target: string; amount: number } {
    return {
      unit: this.data.unit.id,
      target: this.data.target.id,
      amount: this.data.amount
    };
  }
}

export type ModifierSpecialEventMap = {
  [MODIFIER_SPECIAL_EVENTS.MODIFIER_BACKSTAB]: BackstabEvent;
};
