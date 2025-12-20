import { TypedSerializableEvent } from '../../utils/typed-emitter';
import type { SigilCard } from '../entities/sigil.entity';

export const SIGIL_EVENTS = {
  SIGIL_BEFORE_COUNTDOWN_DECREASE: 'artifact.before-countdown-decrease',
  SIGIL_AFTER_COUNTDOWN_DECREASE: 'artifact.after-countdown-decrease',
  SIGIL_BEFORE_COUNTDOWN_INCREASE: 'artifact.before-countdown-increase',
  SIGIL_AFTER_COUNTDOWN_INCREASE: 'artifact.after-countdown-increase',
  SIGIL_COUNTDOWN_REACHED: 'artifact.countdown-reached'
} as const;

export class SigilBeforeCountdownDecreaseEvent extends TypedSerializableEvent<
  { card: SigilCard },
  { card: string }
> {
  serialize() {
    return { card: this.data.card.id };
  }
}

export class SigilAfterCountdownDecreaseEvent extends TypedSerializableEvent<
  { card: SigilCard },
  { card: string }
> {
  serialize() {
    return { card: this.data.card.id };
  }
}

export class SigilBeforeCountdownIncreaseEvent extends TypedSerializableEvent<
  { card: SigilCard },
  { card: string }
> {
  serialize() {
    return { card: this.data.card.id };
  }
}

export class SigilAfterCountdownIncreaseEvent extends TypedSerializableEvent<
  { card: SigilCard },
  { card: string }
> {
  serialize() {
    return { card: this.data.card.id };
  }
}

export class SigilCountdownReachedEvent extends TypedSerializableEvent<
  { card: SigilCard },
  { card: string }
> {
  serialize() {
    return { card: this.data.card.id };
  }
}

export type SigilEventMap = {
  [SIGIL_EVENTS.SIGIL_BEFORE_COUNTDOWN_DECREASE]: SigilBeforeCountdownDecreaseEvent;
  [SIGIL_EVENTS.SIGIL_AFTER_COUNTDOWN_DECREASE]: SigilAfterCountdownDecreaseEvent;
  [SIGIL_EVENTS.SIGIL_BEFORE_COUNTDOWN_INCREASE]: SigilBeforeCountdownIncreaseEvent;
  [SIGIL_EVENTS.SIGIL_AFTER_COUNTDOWN_INCREASE]: SigilAfterCountdownIncreaseEvent;
  [SIGIL_EVENTS.SIGIL_COUNTDOWN_REACHED]: SigilCountdownReachedEvent;
};
