import type { DatabaseReader } from '../../_generated/server';
import type { UserId } from '../../users/entities/user.entity';
import type { BoosterPack, BoosterPackId } from '../entities/booster-pack.entity';
import { BOOSTER_PACK_STATUS } from '../card.constants';

export class BoosterPackReadRepository {
  static INJECTION_KEY = 'boosterPackReadRepo' as const;

  constructor(private ctx: { db: DatabaseReader }) {}

  async getById(packId: BoosterPackId): Promise<BoosterPack | null> {
    return this.ctx.db.get(packId);
  }

  async getByOwnerId(userId: UserId): Promise<BoosterPack[]> {
    return this.ctx.db
      .query('boosterPacks')
      .withIndex('by_owner_id', q => q.eq('ownerId', userId))
      .collect();
  }

  async getPendingByOwnerId(userId: UserId): Promise<BoosterPack[]> {
    return this.ctx.db
      .query('boosterPacks')
      .withIndex('by_owner_id_status', q =>
        q.eq('ownerId', userId).eq('status', BOOSTER_PACK_STATUS.PENDING)
      )
      .collect();
  }

  async countPendingByOwner(userId: UserId): Promise<number> {
    const packs = await this.getPendingByOwnerId(userId);
    return packs.length;
  }
}
