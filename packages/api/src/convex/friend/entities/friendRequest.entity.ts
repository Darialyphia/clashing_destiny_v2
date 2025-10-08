import type { UserId } from 'lucia';
import type { Doc, Id } from '../../_generated/dataModel';
import { Entity } from '../../shared/entity';
import { FRIEND_REQUEST_STATUS } from '../friend.constants';

export type FriendRequestId = Id<'friendRequests'>;
export type FriendRequestDoc = Doc<'friendRequests'>;

export class FriendRequest extends Entity<FriendRequestId, FriendRequestDoc> {
  static from(doc: FriendRequestDoc) {
    return new FriendRequest(doc._id, doc);
  }

  constructor(id: FriendRequestId, data: FriendRequestDoc) {
    super(id, data);
  }

  get senderId() {
    return this.data.senderId;
  }

  get receiverId() {
    return this.data.receiverId;
  }

  get status() {
    return this.data.status;
  }

  get seen() {
    return this.data.seen;
  }

  canMarkAsSeen(user: UserId) {
    return this.data.receiverId === user;
  }

  markAsSeen() {
    this.data.seen = true;
  }

  canAccept(userId: UserId) {
    return (
      this.data.receiverId === userId &&
      this.data.status === FRIEND_REQUEST_STATUS.PENDING
    );
  }

  canDecline(userId: UserId) {
    return (
      this.data.receiverId === userId &&
      this.data.status === FRIEND_REQUEST_STATUS.PENDING
    );
  }

  canResend(userId: UserId) {
    return (
      this.data.senderId === userId && this.data.status !== FRIEND_REQUEST_STATUS.PENDING
    );
  }
  accept() {
    this.data.status = FRIEND_REQUEST_STATUS.ACCEPTED;
  }

  decline() {
    this.data.status = FRIEND_REQUEST_STATUS.DECLINED;
  }

  resend() {
    this.data.status = FRIEND_REQUEST_STATUS.PENDING;
    this.data.seen = false;
  }
}
