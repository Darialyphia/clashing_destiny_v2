import { assert } from '@game/shared';
import type { Doc, Id } from '../../_generated/dataModel';
import { Entity } from '../../shared/entity';
import type { User, UserId } from '../../users/entities/user.entity';
import {
  BOOSTER_PACK_STATUS,
  type BoosterPackStatus,
  type PackType
} from '../card.constants';

export type BoosterPackId = Id<'boosterPacks'>;
export type BoosterPackDoc = Doc<'boosterPacks'>;

export class BoosterPack extends Entity<BoosterPackId, BoosterPackDoc> {
  get packType(): PackType {
    return this.data.packType;
  }

  get status() {
    return this.data.status;
  }

  get ownerId() {
    return this.data.ownerId;
  }

  get content() {
    return this.data.content;
  }

  get acquiredAt() {
    return this.data.acquiredAt;
  }

  get openedAt() {
    return this.data.openedAt;
  }

  get isOpened() {
    return this.data.status === BOOSTER_PACK_STATUS.OPENED;
  }

  get isPending() {
    return this.data.status === BOOSTER_PACK_STATUS.PENDING;
  }

  isOwnedBy(userId: UserId) {
    return this.data.ownerId === userId;
  }

  open() {
    assert(this.isPending, 'Booster pack is already opened');
    this.data.status = BOOSTER_PACK_STATUS.OPENED;
    this.data.openedAt = Date.now();
  }
}
