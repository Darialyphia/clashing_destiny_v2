import type { DatabaseReader, DatabaseWriter } from '../../_generated/server';
import { Gift, type GiftDoc, type GiftId } from '../entities/gift.entity';
import type { UserId } from '../../users/entities/user.entity';
import { GIFT_STATES, type GiftState, type GiftSource } from '../gift.constants';
import type { GiftMapper } from '../mappers/gift.mapper';

export class GiftReadRepository {
  static INJECTION_KEY = 'giftReadRepo' as const;

  constructor(private ctx: { db: DatabaseReader }) {}

  async getById(giftId: GiftId) {
    return this.ctx.db.get(giftId);
  }

  async getByReceiverId(receiverId: UserId) {
    return this.ctx.db
      .query('gifts')
      .withIndex('by_receiver_id', q => q.eq('receiverId', receiverId))
      .order('desc')
      .collect();
  }

  async getByReceiverIdAndState(receiverId: UserId, state: GiftState) {
    return this.ctx.db
      .query('gifts')
      .withIndex('by_receiver_id', q => q.eq('receiverId', receiverId))
      .filter(q => q.eq(q.field('state'), state))
      .collect();
  }

  async getUnclaimedByReceiverId(receiverId: UserId) {
    return this.getByReceiverIdAndState(receiverId, GIFT_STATES.ISSUED);
  }

  async getClaimedByReceiverId(receiverId: UserId) {
    return this.getByReceiverIdAndState(receiverId, GIFT_STATES.CLAIMED);
  }

  async getAll() {
    return this.ctx.db.query('gifts').collect();
  }
}

export class GiftRepository {
  static INJECTION_KEY = 'giftRepo' as const;

  constructor(
    private ctx: {
      db: DatabaseWriter;
      giftMapper: GiftMapper;
    }
  ) {}

  private buildEntity(doc: GiftDoc) {
    return new Gift(doc._id, doc);
  }

  async getById(giftId: GiftId) {
    const doc = await this.ctx.db.get(giftId);
    if (!doc) return null;
    return this.buildEntity(doc);
  }

  async getByReceiverId(receiverId: UserId) {
    const docs = await this.ctx.db
      .query('gifts')
      .withIndex('by_receiver_id', q => q.eq('receiverId', receiverId))
      .collect();

    return docs.map(doc => this.buildEntity(doc));
  }

  async getByReceiverIdAndState(receiverId: UserId, state: GiftState) {
    const docs = await this.ctx.db
      .query('gifts')
      .withIndex('by_receiver_id', q => q.eq('receiverId', receiverId))
      .filter(q => q.eq(q.field('state'), state))
      .collect();

    return docs.map(doc => this.buildEntity(doc));
  }

  async getUnclaimedByReceiverId(receiverId: UserId) {
    return this.getByReceiverIdAndState(receiverId, GIFT_STATES.ISSUED);
  }

  async create(data: {
    receiverId: UserId;
    name: string;
    source: GiftSource;
    contents: GiftDoc['contents'];
  }) {
    const giftId = await this.ctx.db.insert('gifts', {
      receiverId: data.receiverId,
      state: GIFT_STATES.ISSUED,
      name: data.name,
      source: data.source,
      contents: data.contents
    });

    return this.getById(giftId);
  }

  async save(gift: Gift) {
    await this.ctx.db.replace(gift.id, this.ctx.giftMapper.toPersistence(gift));
    return gift;
  }

  async delete(giftId: GiftId) {
    await this.ctx.db.delete(giftId);
  }
}
