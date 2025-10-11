import type { Doc, Id } from '../../_generated/dataModel';
import { Entity } from '../../shared/entity';
import type { UserId } from '../../users/entities/user.entity';
import { GIFT_STATES } from '../gift.constants';

export type GiftDoc = Doc<'gifts'>;
export type GiftId = Id<'gifts'>;

export class Gift extends Entity<GiftId, GiftDoc> {
  constructor(id: Id<'gifts'>, data: GiftDoc) {
    super(id, data);
  }

  get receiverId() {
    return this.data.receiverId;
  }

  get name() {
    return this.data.name;
  }

  get state() {
    return this.data.state;
  }

  get source() {
    return this.data.source;
  }

  get contents() {
    return this.data.contents;
  }

  get openedAt() {
    return this.data.openedAt;
  }

  isIssued(): boolean {
    return this.state === GIFT_STATES.ISSUED;
  }

  isClaimed(): boolean {
    return this.state === GIFT_STATES.CLAIMED;
  }

  isRevoked(): boolean {
    return this.state === GIFT_STATES.REVOKED;
  }

  canBeClaimed(): boolean {
    return this.isIssued();
  }

  canBeClaimedBy(userId: UserId) {
    return this.canBeClaimed() && this.receiverId === userId;
  }

  canBeRevoked(): boolean {
    return this.isIssued();
  }

  claim(): void {
    if (!this.canBeClaimed()) {
      throw new Error('Gift cannot be claimed');
    }
    this.data.state = GIFT_STATES.CLAIMED;
    this.data.openedAt = Date.now();
  }

  revoke(): void {
    if (!this.canBeRevoked()) {
      throw new Error('Gift cannot be revoked');
    }
    this.data.state = GIFT_STATES.REVOKED;
  }
}
