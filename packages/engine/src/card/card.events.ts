import { TypedSerializableEvent } from '../utils/typed-emitter';
import type { CARD_EVENTS } from './card.enums';
import type { CardLocation } from './components/card-manager.component';
import type { AnyCard, SerializedCard } from './entities/card.entity';

export class CardExhaustEvent extends TypedSerializableEvent<
  { card: AnyCard },
  { card: SerializedCard }
> {
  serialize() {
    return {
      card: this.data.card.serialize()
    };
  }
}

export class CardWakeUpEvent extends TypedSerializableEvent<
  { card: AnyCard },
  { card: SerializedCard }
> {
  serialize() {
    return {
      card: this.data.card.serialize()
    };
  }
}

export class CardDiscardEvent extends TypedSerializableEvent<
  { card: AnyCard },
  { card: SerializedCard }
> {
  serialize() {
    return {
      card: this.data.card.serialize()
    };
  }
}

export class CardAddToHandevent extends TypedSerializableEvent<
  { card: AnyCard; index: number | null },
  { card: SerializedCard; index: number | null }
> {
  serialize() {
    return {
      card: this.data.card.serialize(),
      index: this.data.index
    };
  }
}

export class CardBeforePlayEvent extends TypedSerializableEvent<
  { card: AnyCard },
  { card: SerializedCard }
> {
  serialize() {
    return {
      card: this.data.card.serialize()
    };
  }
}

export class CardAfterPlayEvent extends TypedSerializableEvent<
  { card: AnyCard },
  { card: SerializedCard }
> {
  serialize() {
    return {
      card: this.data.card.serialize()
    };
  }
}

export class CardBeforePlayWithoutAffinityMatchEvent extends TypedSerializableEvent<
  { card: AnyCard },
  { card: SerializedCard }
> {
  serialize() {
    return {
      card: this.data.card.serialize()
    };
  }
}

export class CardAfterPlayWithoutAffinityMatchEvent extends TypedSerializableEvent<
  { card: AnyCard },
  { card: SerializedCard }
> {
  serialize() {
    return {
      card: this.data.card.serialize()
    };
  }
}

export class CardBeforeDestroyEvent extends TypedSerializableEvent<
  { card: AnyCard },
  { card: SerializedCard }
> {
  serialize() {
    return {
      card: this.data.card.serialize()
    };
  }
}

export class CardAfterDestroyEvent extends TypedSerializableEvent<
  { card: AnyCard },
  { card: SerializedCard }
> {
  serialize() {
    return {
      card: this.data.card.serialize()
    };
  }
}

export class CardLeaveBoardEvent extends TypedSerializableEvent<
  { card: AnyCard },
  { card: SerializedCard }
> {
  serialize() {
    return {
      card: this.data.card.serialize()
    };
  }
}

export type CardEventMap = {
  [CARD_EVENTS.CARD_EXHAUST]: CardExhaustEvent;
  [CARD_EVENTS.CARD_WAKE_UP]: CardWakeUpEvent;
  [CARD_EVENTS.CARD_DISCARD]: CardDiscardEvent;
  [CARD_EVENTS.CARD_ADD_TO_HAND]: CardAddToHandevent;
  [CARD_EVENTS.CARD_LEAVE_BOARD]: CardLeaveBoardEvent;
  [CARD_EVENTS.CARD_BEFORE_PLAY]: CardBeforePlayEvent;
  [CARD_EVENTS.CARD_AFTER_PLAY]: CardAfterPlayEvent;
  [CARD_EVENTS.CARD_BEFORE_PLAY_WITHOUT_AFFINITY_MATCH]: CardBeforePlayWithoutAffinityMatchEvent;
  [CARD_EVENTS.CARD_AFTER_PLAY_WITHOUT_AFFINITY_MATCH]: CardAfterPlayWithoutAffinityMatchEvent;
  [CARD_EVENTS.CARD_BEFORE_DESTROY]: CardBeforeDestroyEvent;
  [CARD_EVENTS.CARD_AFTER_DESTROY]: CardAfterDestroyEvent;
};
