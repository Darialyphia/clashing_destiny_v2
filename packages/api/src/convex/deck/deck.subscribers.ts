import { AccountCreatedEvent } from '../auth/events/accountCreated.event';
import { eventEmitter, type EventEmitter } from '../shared/eventEmitter';
import type { Scheduler } from 'convex/server';
import { premadeDecks } from './premadeDecks';
import { internal } from '../_generated/api';
import { GIFT_KINDS, GIFT_SOURCES } from '../gift/gift.constants';
import { collectableCards } from '@game/engine/src/generated/cards';
import { CardDestroyedEvent } from '../card/events/cardDestroyed.event';
import type { DeckRepository } from './repositories/deck.repository';
import type { CardRepository } from '../card/repositories/card.repository';
import { isDefined } from '@game/shared';

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
    eventEmitter.on(CardDestroyedEvent.EVENT_NAME, this.onCardDestroyed.bind(this));
  }

  private async onAccountCreated(event: AccountCreatedEvent) {
    const starterDecks = premadeDecks.filter(deck => deck.isGrantedOnAccountCreation);

    for (const deck of starterDecks) {
      await this.ctx.scheduler.runAfter(0, internal.gifts.give, {
        receiverId: event.userId,
        icon: 'gift-default',
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
      icon: 'gift-default',
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

  private async onCardDestroyed(event: CardDestroyedEvent) {
    const decks = await this.ctx.deckRepo.findByOwnerId(event.data.userId);
    const card = await this.ctx.cardRepo.getById(event.data.cardId);

    for (const deck of decks) {
      const copiesInDeck = deck.getCopiesOfCard(event.data.cardId);
      const copiesOwned = card?.copiesOwned.value ?? 0;
      if (copiesInDeck < copiesOwned) return;

      deck.update({
        cards: deck.cards
          .map(cardEntry => {
            if (cardEntry.cardId !== event.data.cardId) return cardEntry;
            if (copiesOwned === 0) return null;

            return {
              ...cardEntry,
              copies: copiesOwned
            };
          })
          .filter(isDefined)
      });
      await this.ctx.deckRepo.save(deck);
    }
  }
}
