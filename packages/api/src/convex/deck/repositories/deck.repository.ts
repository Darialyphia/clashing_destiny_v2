import type { DatabaseReader, DatabaseWriter } from '../../_generated/server';
import type { CardId } from '../../card/entities/card.entity';
import type { CardRepository } from '../../card/repositories/card.repository';
import type { UserId } from '../../users/entities/user.entity';
import { AppError } from '../../utils/error';
import { DEFAULT_DECK_NAME } from '../deck.constants';
import { Deck, type DeckId } from '../entities/deck.entity';
import type { DeckMapper } from '../mappers/deck.mapper';
import { premadeDecks } from '../premadeDecks';

export class DeckReadRepository {
  static INJECTION_KEY = 'deckReadRepo' as const;

  constructor(private ctx: { db: DatabaseReader }) {}

  async getById(id: DeckId) {
    return this.ctx.db.get(id);
  }

  async getByOwnerId(ownerId: UserId) {
    return this.ctx.db
      .query('decks')
      .withIndex('by_owner_id', q => q.eq('ownerId', ownerId))
      .collect();
  }
}

export class DeckRepository {
  static INJECTION_KEY = 'deckRepo' as const;

  constructor(
    private ctx: { db: DatabaseWriter; cardRepo: CardRepository; deckMapper: DeckMapper }
  ) {}

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
      const identicalCard = await this.ctx.cardRepo.findIdentical(
        userId,
        deckCard.blueprintId,
        deckCard.isFoil
      );

      if (identicalCard) {
        identicalCard.addCopies(deckCard.copies);
        await this.ctx.cardRepo.save(identicalCard);
        mainDeckCards.push({
          cardId: identicalCard.id,
          copies: deckCard.copies
        });
        continue;
      }

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
      destinyDeck: destinyDeckCards,
      spellSchools: premadeDeck.spellSchools
    });

    const deckDoc = await this.ctx.db.get(deckDocId);
    if (!deckDoc) {
      throw new Error('Failed to retrieve created deck');
    }

    return new Deck(deckDoc._id, deckDoc);
  }

  async create(ownerId: UserId) {
    const deckDocId = await this.ctx.db.insert('decks', {
      name: DEFAULT_DECK_NAME,
      ownerId: ownerId,
      mainDeck: [],
      destinyDeck: [],
      spellSchools: []
    });

    const deckDoc = await this.ctx.db.get(deckDocId);
    if (!deckDoc) {
      throw new AppError('Failed to retrieve created deck');
    }

    return new Deck(deckDoc._id, deckDoc);
  }

  delete(deck: Deck) {
    return this.ctx.db.delete(deck.id);
  }

  save(deck: Deck) {
    return this.ctx.db.replace(deck.id, this.ctx.deckMapper.toPersistence(deck));
  }
}
