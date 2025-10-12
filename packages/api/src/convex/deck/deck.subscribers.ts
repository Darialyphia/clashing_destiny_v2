import { AccountCreatedEvent } from '../auth/events/accountCreated.event';
import { eventEmitter, type EventEmitter } from '../shared/eventEmitter';
import type { Scheduler } from 'convex/server';
import { premadeDecks } from './premadeDecks';
import { internal } from '../_generated/api';
import { GIFT_KINDS, GIFT_SOURCES } from '../gift/gift.constants';
import { collectableCards } from '@game/engine/src/generated/cards';
export class DeckSubscribers {
  static INJECTION_KEY = 'deckSubscribers' as const;

  constructor(private ctx: { scheduler: Scheduler; eventEmitter: EventEmitter }) {
    eventEmitter.on(AccountCreatedEvent.EVENT_NAME, this.onAccountCreated.bind(this));
  }

  private async onAccountCreated(event: AccountCreatedEvent) {
    const starterDecks = premadeDecks.filter(deck => deck.isGrantedOnAccountCreation);

    for (const deck of starterDecks) {
      await this.ctx.scheduler.runAfter(0, internal.gifts.give, {
        receiverId: event.userId,
        name: `Welcome Gift: ${deck.name}`,
        source: GIFT_SOURCES.SIGNUP_GIFT,
        contents: [
          {
            kind: GIFT_KINDS.DECK,
            deckId: deck.id
          }
        ]
      });
    }

    await this.ctx.scheduler.runAfter(0, internal.gifts.give, {
      receiverId: event.userId,
      name: 'Pre Alpha Welcome Gift: Full collection unlock !',
      source: GIFT_SOURCES.PROMOTION,
      contents: [
        {
          kind: GIFT_KINDS.CARDS,
          cards: Object.values(collectableCards).map(card => ({
            blueprintId: card,
            isFoil: false,
            amount: 4
          }))
        }
      ]
    });
  }
}
