import type { UserId } from '../../users/entities/user.entity';
import type { BoosterPackId } from '../entities/booster-pack.entity';

export class BoosterPackOpenedEvent {
  static EVENT_NAME = 'boosterPackOpened' as const;

  constructor(
    readonly data: {
      userId: UserId;
      packId: BoosterPackId;
      packType: string;
      cardsObtained: Array<{
        blueprintId: string;
        isFoil: boolean;
      }>;
    }
  ) {}
}
