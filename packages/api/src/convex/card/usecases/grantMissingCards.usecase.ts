import { GIFT_KINDS, GIFT_SOURCES } from '../../gift/gift.constants';
import type { GiftRepository } from '../../gift/repositories/gift.repository';
import type { UseCase } from '../../usecase';
import type { UserId } from '../../users/entities/user.entity';
import type { CardRepository } from '../repositories/card.repository';
import { collectableCards } from '@game/engine/src/generated/cards';

export type GrantMissingCardsUseCaseInput = {
  userId: UserId;
};

export type GrantMissingCardsUseCaseOutput = {
  success: boolean;
  grantedCards: Array<{ blueprintId: string; copies: number }>;
};

export class GrantMissingCardsUseCase
  implements UseCase<GrantMissingCardsUseCaseInput, GrantMissingCardsUseCaseOutput>
{
  static INJECTION_KEY = 'grantMissingCardsUseCase';

  constructor(private ctx: { cardRepo: CardRepository; giftRepo: GiftRepository }) {}

  async execute(
    input: GrantMissingCardsUseCaseInput
  ): Promise<GrantMissingCardsUseCaseOutput> {
    const MAX_COPIES = 4;

    const cardsToGift: Array<{ blueprintId: string; copies: number }> = [];

    for (const cardName of Object.values(collectableCards)) {
      const card = await this.ctx.cardRepo.findIdentical(input.userId, cardName, false);
      const copiesOwned = card?.copiesOwned.value ?? 0;
      if (copiesOwned < MAX_COPIES) {
        const copiesNeeded = MAX_COPIES - copiesOwned;
        cardsToGift.push({ blueprintId: cardName, copies: copiesNeeded });
      }
    }

    if (cardsToGift.length > 0) {
      await this.ctx.giftRepo.create({
        receiverId: input.userId,
        source: GIFT_SOURCES.COMPENSATION,
        name: 'Collection Completion Gift',
        contents: [
          {
            kind: GIFT_KINDS.CARDS,
            cards: cardsToGift.map(card => ({
              blueprintId: card.blueprintId,
              isFoil: false,
              amount: card.copies
            }))
          }
        ]
      });
    }

    return { success: true, grantedCards: cardsToGift };
  }
}
