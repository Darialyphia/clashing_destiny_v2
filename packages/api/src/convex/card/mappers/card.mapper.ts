import type { BetterOmit } from '@game/shared';
import type { Card, CardDoc } from '../entities/card.entity';

export class CardMapper {
  static INJECTION_KEY = 'cardMapper' as const;

  toPersistence(card: Card): BetterOmit<CardDoc, '_creationTime'> {
    return {
      _id: card.id,
      ownerId: card.ownerId,
      blueprintId: card.blueprintId,
      isFoil: card.isFoil,
      copiesOwned: card.copiesOwned.value
    };
  }
}
