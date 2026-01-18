import type { BetterOmit } from '@game/shared';
import type { BoosterPack, BoosterPackDoc } from '../entities/booster-pack.entity';

export class BoosterPackMapper {
  static INJECTION_KEY = 'boosterPackMapper' as const;

  toPersistence(boosterPack: BoosterPack): BetterOmit<BoosterPackDoc, '_creationTime'> {
    return {
      _id: boosterPack.id,
      ownerId: boosterPack.ownerId,
      packType: boosterPack.packType,
      status: boosterPack.status,
      acquiredAt: boosterPack.acquiredAt,
      openedAt: boosterPack.openedAt,
      content: boosterPack.content
    };
  }
}
