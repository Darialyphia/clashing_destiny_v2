import type { Values } from '@game/shared';
import { TypedSerializableEvent } from '../utils/typed-emitter';
import type { Unit } from '../unit/unit.entity';
import type { Player } from '../player/player.entity';

export const MODIFIER_SPECIAL_EVENTS = {
  MODIFIER_BACKSTAB: 'modifier.backstab'
} as const;

export type ModifierSpecialEvents = Values<typeof MODIFIER_SPECIAL_EVENTS>;

export class BackstabEvent extends TypedSerializableEvent<
  {
    attacker: Unit | Player;
    target: Unit;
    amount: number;
  },
  {
    attacker: string;
    target: string;
    amount: number;
  }
> {
  serialize(): { attacker: string; target: string; amount: number } {
    return {
      attacker: this.data.attacker.id,
      target: this.data.target.id,
      amount: this.data.amount
    };
  }
}

export type ModifierSpecialEventMap = {
  [MODIFIER_SPECIAL_EVENTS.MODIFIER_BACKSTAB]: BackstabEvent;
};
