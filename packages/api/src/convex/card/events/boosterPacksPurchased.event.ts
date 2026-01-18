import type { UserId } from '../../users/entities/user.entity';
import type { BoosterPackId } from '../entities/booster-pack.entity';

export class BoosterPacksPurchasedEvent {
  static EVENT_NAME = 'boosterPacksPurchased' as const;

  constructor(
    readonly data: {
      userId: UserId;
      packType: string;
      quantity: number;
      packIds: BoosterPackId[];
      goldSpent: number;
    }
  ) {}
}
