import type { BoosterPacksPurchasedEvent } from './events/boosterPacksPurchased.event';
import type { BoosterPackOpenedEvent } from './events/boosterPackOpened.event';
import type { CardDecraftedEvent } from './events/cardDecrafted.event';

export type CardEventMap = {
  [BoosterPacksPurchasedEvent.EVENT_NAME]: BoosterPacksPurchasedEvent;
  [BoosterPackOpenedEvent.EVENT_NAME]: BoosterPackOpenedEvent;
  [CardDecraftedEvent.EVENT_NAME]: CardDecraftedEvent;
};
