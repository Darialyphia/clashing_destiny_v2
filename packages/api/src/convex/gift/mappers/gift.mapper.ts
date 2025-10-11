import type { GiftDoc } from '../entities/gift.entity';
import { Gift } from '../entities/gift.entity';

export class GiftMapper {
  static INJECTION_KEY = 'giftMapper' as const;

  toPersistence(gift: Gift): Omit<GiftDoc, '_id' | '_creationTime'> {
    return {
      receiverId: gift.receiverId,
      state: gift.state,
      name: gift.name,
      openedAt: gift.openedAt,
      source: gift.source,
      contents: gift.contents
    };
  }
}
