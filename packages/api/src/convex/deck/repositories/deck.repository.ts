import type { QueryContainer } from '../../shared/container';
import type { UserId } from '../../users/entities/user.entity';
import { Deck, type DeckId } from '../entities/deck.entity';

export class DeckReadRepository {
  static INJECTION_KEY = 'deckReadRepo' as const;

  constructor(private ctx: QueryContainer) {}

  async findById(id: DeckId) {
    return this.ctx.db.get(id);
  }

  async findByOwnerId(ownerId: UserId) {
    return this.ctx.db
      .query('decks')
      .withIndex('by_owner_id', q => q.eq('ownerId', ownerId))
      .collect();
  }
}

export class DeckRepository {
  static INJECTION_KEY = 'deckRepo' as const;

  constructor(private ctx: QueryContainer) {}

  async findById(id: DeckId) {
    const doc = await this.ctx.db.get(id);
    if (!doc) return null;

    return new Deck(doc._id, doc);
  }

  async findByOwnerId(ownerId: UserId) {
    const docs = await this.ctx.db
      .query('decks')
      .withIndex('by_owner_id', q => q.eq('ownerId', ownerId))
      .collect();

    return docs.map(doc => new Deck(doc._id, doc));
  }
}
