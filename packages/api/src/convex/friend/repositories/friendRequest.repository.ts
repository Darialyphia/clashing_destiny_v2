import type { Id } from '../../_generated/dataModel';
import type { DatabaseReader, DatabaseWriter } from '../../_generated/server';
import { FriendRequest } from '../entities/friendRequest.entity';
import type { FriendRequestMapper } from '../mappers/friendRequest.mapper';

export class FriendRequestReadRepository {
  static INJECTION_KEY = 'friendRequestReadRepo' as const;

  constructor(private ctx: { db: DatabaseReader }) {}

  async getById(friendRequestId: Id<'friendRequests'>) {
    return this.ctx.db.get(friendRequestId);
  }

  async getBySenderAndReceiver(senderId: Id<'users'>, receiverId: Id<'users'>) {
    return this.ctx.db
      .query('friendRequests')
      .withIndex('by_user_id', q =>
        q.eq('receiverId', receiverId).eq('senderId', senderId)
      )
      .unique();
  }

  async getBySenderId(senderId: Id<'users'>) {
    return this.ctx.db
      .query('friendRequests')
      .withIndex('by_sender_id', q => q.eq('senderId', senderId))
      .collect();
  }

  async getByReceiverId(receiverId: Id<'users'>) {
    return this.ctx.db
      .query('friendRequests')
      .withIndex('by_user_id', q => q.eq('receiverId', receiverId))
      .collect();
  }

  async getPendingByReceiverId(receiverId: Id<'users'>) {
    return this.ctx.db
      .query('friendRequests')
      .withIndex('by_user_id', q => q.eq('receiverId', receiverId))
      .filter(q => q.eq(q.field('status'), 'pending'))
      .collect();
  }

  async getAcceptedByUserId(userId: Id<'users'>) {
    const asSender = await this.ctx.db
      .query('friendRequests')
      .withIndex('by_sender_id', q => q.eq('senderId', userId))
      .filter(q => q.eq(q.field('status'), 'accepted'))
      .collect();

    const asReceiver = await this.ctx.db
      .query('friendRequests')
      .withIndex('by_user_id', q => q.eq('receiverId', userId))
      .filter(q => q.eq(q.field('status'), 'accepted'))
      .collect();

    return [...asSender, ...asReceiver];
  }
}

export class FriendRequestRepository {
  static INJECTION_KEY = 'friendRequestRepo' as const;

  constructor(
    private ctx: { db: DatabaseWriter; friendRequestMapper: FriendRequestMapper }
  ) {}

  async getById(friendRequestId: Id<'friendRequests'>) {
    const doc = await this.ctx.db.get(friendRequestId);
    if (!doc) return null;

    return FriendRequest.from(doc);
  }

  async getBySenderAndReceiver(senderId: Id<'users'>, receiverId: Id<'users'>) {
    const doc = await this.ctx.db
      .query('friendRequests')
      .withIndex('by_user_id', q =>
        q.eq('receiverId', receiverId).eq('senderId', senderId)
      )
      .unique();

    if (!doc) return null;

    return FriendRequest.from(doc);
  }

  async getBySenderId(senderId: Id<'users'>) {
    const docs = await this.ctx.db
      .query('friendRequests')
      .withIndex('by_sender_id', q => q.eq('senderId', senderId))
      .collect();

    return docs.map(doc => FriendRequest.from(doc));
  }

  async getByReceiverId(receiverId: Id<'users'>) {
    const docs = await this.ctx.db
      .query('friendRequests')
      .withIndex('by_user_id', q => q.eq('receiverId', receiverId))
      .collect();

    return docs.map(doc => FriendRequest.from(doc));
  }

  async getPendingByReceiverId(receiverId: Id<'users'>) {
    const docs = await this.ctx.db
      .query('friendRequests')
      .withIndex('by_user_id', q => q.eq('receiverId', receiverId))
      .filter(q => q.eq(q.field('status'), 'pending'))
      .collect();

    return docs.map(doc => FriendRequest.from(doc));
  }

  async getUnseenByReceiverId(receiverId: Id<'users'>) {
    const docs = await this.ctx.db
      .query('friendRequests')
      .withIndex('by_user_id', q => q.eq('receiverId', receiverId))
      .filter(q => q.eq(q.field('seen'), false))
      .collect();

    return docs.map(doc => FriendRequest.from(doc));
  }

  async areFriends(userId1: Id<'users'>, userId2: Id<'users'>) {
    // Check if there's an accepted friend request between the two users (in either direction)
    const request1 = await this.ctx.db
      .query('friendRequests')
      .withIndex('by_user_id', q => q.eq('receiverId', userId1).eq('senderId', userId2))
      .filter(q => q.eq(q.field('status'), 'accepted'))
      .unique();

    if (request1) return true;

    const request2 = await this.ctx.db
      .query('friendRequests')
      .withIndex('by_user_id', q => q.eq('receiverId', userId2).eq('senderId', userId1))
      .filter(q => q.eq(q.field('status'), 'accepted'))
      .unique();

    return !!request2;
  }

  async create(input: {
    senderId: Id<'users'>;
    receiverId: Id<'users'>;
    status: 'pending' | 'accepted' | 'declined';
    seen: boolean;
  }) {
    return this.ctx.db.insert('friendRequests', {
      senderId: input.senderId,
      receiverId: input.receiverId,
      status: input.status,
      seen: input.seen
    });
  }

  save(friendRequest: FriendRequest) {
    return this.ctx.db.replace(
      friendRequest.id,
      this.ctx.friendRequestMapper.toPersistence(friendRequest)
    );
  }

  async delete(friendRequestId: Id<'friendRequests'>) {
    return this.ctx.db.delete(friendRequestId);
  }
}
