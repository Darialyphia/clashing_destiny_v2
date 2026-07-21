import { isString } from 'lodash-es';
import type { Id, Doc } from '../../_generated/dataModel';
import { Entity } from '../../shared/entity';
import type { User, UserId } from '../../users/entities/user.entity';
import type { CardId } from '../../card/entities/card.entity';

export type DeckId = Id<'decks'>;
export type DeckDoc = Doc<'decks'>;

export class Deck extends Entity<DeckId, DeckDoc> {
  get name() {
    return this.data.name;
  }

  get cards() {
    return this.data.cards;
  }

  get ownerId() {
    return this.data.ownerId;
  }

  isOwnedBy(userOrId: User | UserId) {
    const userId = isString(userOrId) ? userOrId : userOrId.id;

    return this.data.ownerId === userId;
  }

  hasCard(cardId: CardId) {
    return this.data.cards.some(card => card.cardId === cardId);
  }

  getCopiesOfCard(cardId: CardId) {
    const cardEntry = this.data.cards.find(card => card.cardId === cardId);
    return cardEntry ? cardEntry.copies : 0;
  }

  update(updates: Partial<Pick<DeckDoc, 'name' | 'cards'>>) {
    this.data = {
      ...this.data,
      ...updates
    };
  }
}
