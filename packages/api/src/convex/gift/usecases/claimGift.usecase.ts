import { match } from 'ts-pattern';
import { ensureAuthenticated } from '../../auth/auth.utils';
import type { AuthSession } from '../../auth/entities/session.entity';
import type { CardRepository } from '../../card/repositories/card.repository';
import type { DeckRepository } from '../../deck/repositories/deck.repository';
import type { UseCase } from '../../usecase';
import { AppError, DomainError } from '../../utils/error';
import type { GiftId } from '../entities/gift.entity';
import type { GiftRepository } from '../repositories/gift.repository';
import { GIFT_KINDS } from '../gift.constants';

export type ClaimGiftInput = {
  giftId: GiftId;
};

export type ClaimGiftOutput = {
  success: boolean;
};

export class ClaimGiftUseCase implements UseCase<ClaimGiftInput, ClaimGiftOutput> {
  static INJECTION_KEY = 'claimGiftUseCase' as const;

  constructor(
    private ctx: {
      giftRepo: GiftRepository;
      cardRepo: CardRepository;
      deckRepo: DeckRepository;
      session: AuthSession | null;
    }
  ) {}

  private async giftCards(content: {
    kind: typeof GIFT_KINDS.CARDS;
    cards: Array<{ blueprintId: string; isFoil: boolean; amount: number }>;
  }) {
    return Promise.all(
      content.cards.map(card =>
        this.ctx.cardRepo.create({
          blueprintId: card.blueprintId,
          isFoil: card.isFoil,
          copiesOwned: card.amount,
          ownerId: this.ctx.session!.userId
        })
      )
    );
  }

  private async giftDeck(content: { kind: typeof GIFT_KINDS.DECK; deckId: string }) {
    await this.ctx.deckRepo.grantPremadeDeckToUser(
      content.deckId,
      this.ctx.session!.userId
    );
  }

  async execute(input: ClaimGiftInput): Promise<ClaimGiftOutput> {
    const session = ensureAuthenticated(this.ctx.session);

    const gift = await this.ctx.giftRepo.getById(input.giftId);
    if (!gift) {
      throw new AppError('Gift not found');
    }

    if (!gift.canBeClaimedBy(session.userId)) {
      throw new DomainError('Gift cannot be claimed');
    }

    gift.claim();
    await this.ctx.giftRepo.save(gift);

    for (const content of gift.contents) {
      match(content)
        .with({ kind: GIFT_KINDS.DECK }, async content => {
          return await this.giftDeck(content);
        })
        .with({ kind: GIFT_KINDS.CARDS }, async content => {
          return await this.giftCards(content);
        })
        .exhaustive();
    }

    return {
      success: true
    };
  }
}
