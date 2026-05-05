import type { Values } from '@game/shared';
import { TypedSerializableEvent } from '../../utils/typed-emitter';
import type { SerializedTrapCard, TrapCard } from '../entities/trap.entity';

export const TRAP_EVENTS = {
  TRAP_TRIGGERED: 'trap.triggered'
} as const;
export type TrapEvents = Values<typeof TRAP_EVENTS>;

export class TrapTriggeredEvent extends TypedSerializableEvent<
  { card: TrapCard },
  { card: SerializedTrapCard }
> {
  serialize() {
    return {
      card: this.data.card.serialize()
    };
  }
}

export type TrapCardEventMap = {
  [TRAP_EVENTS.TRAP_TRIGGERED]: TrapTriggeredEvent;
};
