import type { Id, Doc } from '../../_generated/dataModel';
import { Entity } from '../../shared/entity';

export type DeckId = Id<'decks'>;
export type DeckDoc = Doc<'decks'>;

export class Deck extends Entity<DeckId, DeckDoc> {
  get name() {
    return this.data.name;
  }
}
