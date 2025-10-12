import { isString } from 'lodash-es';
import type { Id, Doc } from '../../_generated/dataModel';
import { Entity } from '../../shared/entity';
import type { User, UserId } from '../../users/entities/user.entity';

export type DeckId = Id<'decks'>;
export type DeckDoc = Doc<'decks'>;

export class Deck extends Entity<DeckId, DeckDoc> {
  get name() {
    return this.data.name;
  }

  get mainDeck() {
    return this.data.mainDeck;
  }

  get destinyDeck() {
    return this.data.destinyDeck;
  }

  get spellSchools() {
    return this.data.spellSchools;
  }

  get ownerId() {
    return this.data.ownerId;
  }

  isOwnedBy(userOrId: User | UserId) {
    const userId = isString(userOrId) ? userOrId : userOrId.id;

    return this.data.ownerId === userId;
  }

  update(updates: Partial<Pick<DeckDoc, 'name' | 'mainDeck' | 'destinyDeck'>>) {
    this.data = {
      ...this.data,
      ...updates
    };
  }
}
