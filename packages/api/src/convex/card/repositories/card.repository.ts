import type { DatabaseReader, DatabaseWriter } from '../../_generated/server';
import type { MutationContainer, QueryContainer } from '../../shared/container';
import type { UserId } from '../../users/entities/user.entity';
import { Card, type CardId } from '../entities/card.entity';
import type { CardMapper } from '../mappers/card.mapper';

export class CardReadRepository {
  static INJECTION_KEY = 'cardReadRepo' as const;

  constructor(private ctx: { db: DatabaseReader }) {}

  async findById(cardId: CardId) {
    return this.ctx.db.get(cardId);
  }

  async findByOwnerId(ownerId: UserId) {
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

  async create(input: {
    ownerId: UserId;
    blueprintId: string;
    isFoil: boolean;
    copiesOwned: number;
  }) {
    return this.ctx.db.insert('cards', input);
  }

  save(card: Card) {
    return this.ctx.db.replace(card.id, this.ctx.cardMapper.toPersistence(card));
  }
}
