import { AccountCreatedEvent } from '../auth/events/accountCreated.event';
import { eventEmitter, type EventEmitter } from '../shared/eventEmitter';
import type { Scheduler } from 'convex/server';
import { premadeDecks } from './premadeDecks';
import { internal } from '../_generated/api';

export class DeckSubscribers {
  static INJECTION_KEY = 'deckSubscribers' as const;

  constructor(private ctx: { scheduler: Scheduler; eventEmitter: EventEmitter }) {
    eventEmitter.on(AccountCreatedEvent.EVENT_NAME, this.onAccountCreated.bind(this));
  }

  private async onAccountCreated(event: AccountCreatedEvent) {
    const starterDecks = premadeDecks.filter(deck => deck.isGrantedOnAccountCreation);

    for (const deck of starterDecks) {
      await this.ctx.scheduler.runAfter(0, internal.decks.grantPremadeDeck, {
        userId: event.userId,
        premadeDeckId: deck.id
      });
    }
  }
}
