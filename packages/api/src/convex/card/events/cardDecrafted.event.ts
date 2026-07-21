import type { UserId } from '../../users/entities/user.entity';
import type { CardId } from '../entities/card.entity';

export class CardDecraftedEvent {
  static EVENT_NAME = 'cardDecrafted' as const;

  constructor(
    readonly data: {
      userId: UserId;
      cardId: CardId;
    }
  ) {}
}
