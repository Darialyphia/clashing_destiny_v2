import type { Doc, Id } from '../../_generated/dataModel';
import type { UserId } from '../../users/entities/user.entity';
import { AppError } from '../../utils/error';
import { BOOSTER_PACK_STATUS, type BoosterPackStatus } from '../card.constants';

export type BoosterPackId = Id<'boosterPacks'>;
export type BoosterPackDoc = Doc<'boosterPacks'>;

export interface BoosterPack {
  _id: BoosterPackId;
  ownerId: UserId;
  packType: string;
  status: BoosterPackStatus;
  acquiredAt: number;
  openedAt?: number;
  content: Array<{
    blueprintId: string;
    isFoil: boolean;
  }>;
}

export function isPending(pack: BoosterPack): boolean {
  return pack.status === BOOSTER_PACK_STATUS.PENDING;
}

export function isOpened(pack: BoosterPack): boolean {
  return pack.status === BOOSTER_PACK_STATUS.OPENED;
}

export function ensurePending(pack: BoosterPack): void {
  if (!isPending(pack)) {
    throw new AppError('Booster pack has already been opened');
  }
}

export function ensureOwnership(pack: BoosterPack, userId: UserId): void {
  if (pack.ownerId !== userId) {
    throw new AppError('Not authorized to access this booster pack');
  }
}
