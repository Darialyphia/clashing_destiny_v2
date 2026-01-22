import type { UseCase } from '../../usecase';
import type { AuthSession } from '../../auth/entities/session.entity';
import { ensureAuthenticated } from '../../auth/auth.utils';
import type { CardRepository } from '../repositories/card.repository';
import type { WalletRepository } from '../../currency/repositories/wallet.repository';
import type { EventEmitter } from '../../shared/eventEmitter';
import { isDefined } from '@game/shared';
import { cardsBySet } from '@game/engine/src/generated/cards';
import {
  DECRAFTING_REWARD_PER_RARITY,
  MAX_COPIES_PER_CARD_DECK_SOURCE
} from '../card.constants';
import { CURRENCY_SOURCES, CURRENCY_TYPES } from '../../currency/currency.constants';
import { CARD_DECK_SOURCES } from '@game/engine/src/card/card.enums';
import type { AwardCurrencyUseCase } from '../../currency/usecases/awardCurrency.usecase';

export interface DecraftExtraCardsOutput {
  totalCardsDecrafted: number;
  totalCraftingShardsGained: number;
  detailsByCard: Array<{
    cardId: string;
    blueprintId: string;
    copiesDecrafted: number;
    shardsGained: number;
  }>;
}

export class DecraftExtraCardsUseCase implements UseCase<never, DecraftExtraCardsOutput> {
  static INJECTION_KEY = 'decraftExtraCardsUseCase' as const;

  constructor(
    protected ctx: {
      session: AuthSession | null;
      cardRepo: CardRepository;
      walletRepo: WalletRepository;
      eventEmitter: EventEmitter;
      awardCurrencyUseCase: AwardCurrencyUseCase;
    }
  ) {}

  async execute(): Promise<DecraftExtraCardsOutput> {
    const session = ensureAuthenticated(this.ctx.session);

    const userCards = await this.ctx.cardRepo.findByOwnerId(session.userId);

    let totalCardsDecrafted = 0;
    let totalCraftingShardsGained = 0;
    const detailsByCard: DecraftExtraCardsOutput['detailsByCard'] = [];
    const allCards = Object.values(cardsBySet).flat();

    for (const card of userCards) {
      const blueprint = allCards.find(c => c.id === card.blueprintId);
      if (!isDefined(blueprint)) {
        continue;
      }

      const maxCopiesAllowed = MAX_COPIES_PER_CARD_DECK_SOURCE[blueprint.deckSource];
      const extraCopies = card.copiesOwned.value - maxCopiesAllowed;

      if (extraCopies > 0) {
        const rewardPerCopy = DECRAFTING_REWARD_PER_RARITY[blueprint.rarity];
        const shardsGained = rewardPerCopy * extraCopies;

        card.removeCopies(extraCopies);
        await this.ctx.cardRepo.save(card);

        totalCardsDecrafted += extraCopies;
        totalCraftingShardsGained += shardsGained;

        detailsByCard.push({
          cardId: card.id,
          blueprintId: card.blueprintId,
          copiesDecrafted: extraCopies,
          shardsGained
        });
      }
    }

    if (totalCraftingShardsGained > 0) {
      await this.ctx.awardCurrencyUseCase.execute({
        userId: session.userId,
        amount: totalCraftingShardsGained,
        currencyType: CURRENCY_TYPES.CRAFTING_SHARDS,
        source: CURRENCY_SOURCES.DECRAFTING
      });
    }

    return {
      totalCardsDecrafted,
      totalCraftingShardsGained,
      detailsByCard
    };
  }
}
