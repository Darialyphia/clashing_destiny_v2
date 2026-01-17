import type { CurrencyAwardedEvent } from './events/currencyAwarded.event';
import type { CurrencySpentEvent } from './events/currencySpent.event';

export type CurrencyEventMap = {
  [CurrencyAwardedEvent.EVENT_NAME]: CurrencyAwardedEvent;
  [CurrencySpentEvent.EVENT_NAME]: CurrencySpentEvent;
};
