import type { DatabaseWriter } from '../../_generated/server';
import type { UserId } from '../../users/entities/user.entity';
import {
  BoosterPack,
  type BoosterPackDoc,
  type BoosterPackId
} from '../entities/booster-pack.entity';
import { BOOSTER_PACK_STATUS } from '../card.constants';
import type { BoosterPackMapper } from '../mappers/boosterPack.mapper';

export class BoosterPackRepository {
  static INJECTION_KEY = 'boosterPackRepo' as const;

  constructor(
    private ctx: { db: DatabaseWriter; boosterPackMapper: BoosterPackMapper }
  ) {}

  private buildEntity(doc: BoosterPackDoc): BoosterPack {
    return new BoosterPack(doc._id, doc);
  }

  async getById(packId: BoosterPackId): Promise<BoosterPack | null> {
    const doc = await this.ctx.db.get(packId);
    if (!doc) {
      return null;
    }
    return this.buildEntity(doc);
  }

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

  save(boosterPack: BoosterPack) {
    return this.ctx.db.replace(
      boosterPack.id,
      this.ctx.boosterPackMapper.toPersistence(boosterPack)
    );
  }
}
