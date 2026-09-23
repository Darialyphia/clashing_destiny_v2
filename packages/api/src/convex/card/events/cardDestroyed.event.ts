import type { UserId } from '../../users/entities/user.entity';
import type { CardId } from '../entities/card.entity';

export class CardDestroyedEvent {
  static EVENT_NAME = 'cardDestroyed' as const;

  constructor(
    readonly data: {
      userId: UserId;
      cardId: CardId;
      remainingCopies: number;
    }
  ) {}
}
