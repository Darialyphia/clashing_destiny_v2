import type { MutationContainer, QueryContainer } from '../../shared/container';
import type { UserId } from '../../users/entities/user.entity';
import { Deck, type DeckId } from '../entities/deck.entity';
import { premadeDecks } from '../premadeDecks';

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

  constructor(private ctx: MutationContainer) {}

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

  async grantPremadeDeckToUser(deckId: string, userId: UserId): Promise<Deck> {
    const premadeDeck = premadeDecks.find(deck => deck.id === deckId);
    if (!premadeDeck) {
      throw new Error(`Premade deck with ID ${deckId} not found`);
    }

    const mainDeckCards = [];
    for (const deckCard of premadeDeck.mainDeck) {
      const cardId = await this.ctx.cardRepo.create({
        ownerId: userId,
        blueprintId: deckCard.blueprintId,
        isFoil: deckCard.isFoil,
        copiesOwned: deckCard.copies
      });

      mainDeckCards.push({
        cardId,
        copies: deckCard.copies
      });
    }

    const destinyDeckCards = [];
    for (const deckCard of premadeDeck.destinyDeck) {
      const cardId = await this.ctx.cardRepo.create({
        ownerId: userId,
        blueprintId: deckCard.blueprintId,
        isFoil: deckCard.isFoil,
        copiesOwned: deckCard.copies
      });

      destinyDeckCards.push({
        cardId,
        copies: deckCard.copies
      });
    }

    const deckDocId = await this.ctx.db.insert('decks', {
      name: premadeDeck.name,
      ownerId: userId,
      mainDeck: mainDeckCards,
      destinyDeck: destinyDeckCards
    });

    const deckDoc = await this.ctx.db.get(deckDocId);
    if (!deckDoc) {
      throw new Error('Failed to retrieve created deck');
    }

    return new Deck(deckDoc._id, deckDoc);
  }
}
