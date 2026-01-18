import type { DatabaseWriter } from '../../_generated/server';
import type { UserId } from '../../users/entities/user.entity';
import type { BoosterPackId } from '../entities/booster-pack.entity';
import { BOOSTER_PACK_STATUS } from '../card.constants';

export class BoosterPackRepository {
  static INJECTION_KEY = 'boosterPackRepo' as const;

  constructor(private ctx: { db: DatabaseWriter }) {}

  async create(data: {
    ownerId: UserId;
    packType: string;
    content: Array<{ blueprintId: string; isFoil: boolean }>;
  }): Promise<BoosterPackId> {
    return this.ctx.db.insert('boosterPacks', {
      ownerId: data.ownerId,
      packType: data.packType as any,
      status: BOOSTER_PACK_STATUS.PENDING,
      acquiredAt: Date.now(),
      content: data.content
    });
  }

  async markAsOpened(packId: BoosterPackId): Promise<void> {
    await this.ctx.db.patch(packId, {
      status: BOOSTER_PACK_STATUS.OPENED,
      openedAt: Date.now()
    });
  }
}
