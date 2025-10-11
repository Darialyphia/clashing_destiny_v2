import type { DatabaseReader, DatabaseWriter } from '../../_generated/server';
import type { UserId } from '../../users/entities/user.entity';
import { Card, type CardId } from '../entities/card.entity';
import type { CardMapper } from '../mappers/card.mapper';

export class CardReadRepository {
  static INJECTION_KEY = 'cardReadRepo' as const;

  constructor(private ctx: { db: DatabaseReader }) {}

  async getById(cardId: CardId) {
    return this.ctx.db.get(cardId);
  }

  async getByOwnerId(ownerId: UserId) {
    return this.ctx.db
      .query('cards')
      .withIndex('by_owner_id', q => q.eq('ownerId', ownerId))
      .collect();
  }
}

export class CardRepository {
  static INJECTION_KEY = 'cardRepo' as const;

  constructor(private ctx: { db: DatabaseWriter; cardMapper: CardMapper }) {}

  async getById(cardId: CardId) {
    const doc = await this.ctx.db.get(cardId);
    if (!doc) return null;
    return Card.from(doc);
  }

  async findByOwnerId(ownerId: UserId) {
    const docs = await this.ctx.db
      .query('cards')
      .withIndex('by_owner_id', q => q.eq('ownerId', ownerId))
      .collect();
    return docs.map(Card.from);
  }

  async findIdentical(ownerId: UserId, blueprintId: string, isFoil: boolean) {
    const docs = await this.ctx.db
      .query('cards')
      .withIndex('by_owner_id_blueprint_id', q =>
        q.eq('ownerId', ownerId).eq('blueprintId', blueprintId).eq('isFoil', isFoil)
      )
      .first();
    if (!docs) return null;

    return Card.from(docs);
  }

  async create(input: {
    ownerId: UserId;
    blueprintId: string;
    isFoil: boolean;
    copiesOwned: number;
  }) {
    const identicalCard = await this.findIdentical(
      input.ownerId,
      input.blueprintId,
      input.isFoil
    );

    if (identicalCard) {
      identicalCard.addCopies(input.copiesOwned);
      await this.save(identicalCard);
      return identicalCard.id;
    } else {
      return this.ctx.db.insert('cards', input);
    }
  }

  save(card: Card) {
    return this.ctx.db.replace(card.id, this.ctx.cardMapper.toPersistence(card));
  }
}
