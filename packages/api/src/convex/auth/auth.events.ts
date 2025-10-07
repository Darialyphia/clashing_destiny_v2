import { AccountCreatedEvent } from './events/accountCreated.event';

export type AuthEventMap = {
  [AccountCreatedEvent.EVENT_NAME]: AccountCreatedEvent;
};
