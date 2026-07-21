import { AccountCreatedEvent } from '../auth/events/accountCreated.event';
import { eventEmitter, type EventEmitter } from '../shared/eventEmitter';
import type { Scheduler } from 'convex/server';
import { premadeDecks } from './premadeDecks';
import { api, internal } from '../_generated/api';
import { GIFT_KINDS, GIFT_SOURCES } from '../gift/gift.constants';
import { collectableCards } from '@game/engine/src/generated/cards';
import { CardDecraftedEvent } from '../card/events/cardDecrafted.event';
import type { DeckRepository } from './repositories/deck.repository';
import type { CardRepository } from '../card/repositories/card.repository';

export class DeckSubscribers {
  static INJECTION_KEY = 'deckSubscribers' as const;

  constructor(
    private ctx: {
      scheduler: Scheduler;
      eventEmitter: EventEmitter;
      deckRepo: DeckRepository;
      cardRepo: CardRepository;
    }
  ) {
    eventEmitter.on(AccountCreatedEvent.EVENT_NAME, this.onAccountCreated.bind(this));
    eventEmitter.on(CardDecraftedEvent.EVENT_NAME, this.onCardDecrafted.bind(this));
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

  private async onCardDecrafted(event: CardDecraftedEvent) {
    const decks = await this.ctx.deckRepo.findByOwnerId(event.data.userId);
    const card = await this.ctx.cardRepo.getById(event.data.cardId);
    if (!card) return;

    for (const deck of decks) {
      const copies = deck.getCopiesOfCard(event.data.cardId);
      if (copies < card.copiesOwned.value) return;

      deck.update({
        cards: deck.cards.map(cardEntry => {
          if (cardEntry.cardId !== event.data.cardId) return cardEntry;
          return {
            ...cardEntry,
            copies: card.copiesOwned.value
          };
        })
      });
      await this.ctx.deckRepo.save(deck);
    }
  }
}
