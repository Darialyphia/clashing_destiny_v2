import type { BoosterPacksPurchasedEvent } from './events/boosterPacksPurchased.event';
import type { BoosterPackOpenedEvent } from './events/boosterPackOpened.event';
import type { CardDestroyedEvent } from './events/cardDestroyed.event';

export type CardEventMap = {
  [BoosterPacksPurchasedEvent.EVENT_NAME]: BoosterPacksPurchasedEvent;
  [BoosterPackOpenedEvent.EVENT_NAME]: BoosterPackOpenedEvent;
  [CardDestroyedEvent.EVENT_NAME]: CardDestroyedEvent;
};
