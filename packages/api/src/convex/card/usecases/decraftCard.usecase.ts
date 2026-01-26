import type { UseCase } from '../../usecase';
import type { AuthSession } from '../../auth/entities/session.entity';
import { ensureAuthenticated } from '../../auth/auth.utils';
import { AppError, DomainError } from '../../utils/error';
import type { CardRepository } from '../repositories/card.repository';
import type { WalletRepository } from '../../currency/repositories/wallet.repository';
import type { EventEmitter } from '../../shared/eventEmitter';
import type { CardId } from '../entities/card.entity';
import { assert, isDefined } from '@game/shared';
import { cardsBySet } from '@game/engine/src/generated/cards';
import { DECRAFTING_REWARD_PER_RARITY } from '../card.constants';
import { CURRENCY_SOURCES, CURRENCY_TYPES } from '../../currency/currency.constants';
import type { AwardCurrencyUseCase } from '../../currency/usecases/awardCurrency.usecase';

export interface DecraftCardInput {
  cardId: CardId;
  amount: number;
}

export interface DecraftCardOutput {
  cardId: CardId;
  craftingShardsGained: number;
  copiesDecrafted: number;
}

export class DecraftCardUseCase implements UseCase<DecraftCardInput, DecraftCardOutput> {
  static INJECTION_KEY = 'decraftCardUseCase' as const;

  constructor(
    protected ctx: {
      session: AuthSession | null;
      cardRepo: CardRepository;
      walletRepo: WalletRepository;
      eventEmitter: EventEmitter;
      awardCurrencyUseCase: AwardCurrencyUseCase;
    }
  ) {}

  async execute(input: DecraftCardInput): Promise<DecraftCardOutput> {
    const session = ensureAuthenticated(this.ctx.session);

    const card = await this.ctx.cardRepo.getById(input.cardId);
    assert(isDefined(card), new AppError('Card not found'));

    assert(
      card.isOwnedBy(session.userId),
      new DomainError('Not authorized to decraft this card')
    );

    assert(input.amount > 0, new DomainError('Amount must be greater than 0'));
    assert(
      card.copiesOwned.value >= input.amount,
      new DomainError(
        `Cannot decraft ${input.amount} copies. Only ${card.copiesOwned.value} available`
      )
    );

    const allCards = Object.values(cardsBySet).flat();
    const blueprint = allCards.find(c => c.id === card.blueprintId);
    assert(isDefined(blueprint), new AppError('Card blueprint not found'));

    const rewardPerCopy = DECRAFTING_REWARD_PER_RARITY[blueprint.rarity];
    const totalReward = rewardPerCopy * input.amount;

    card.removeCopies(input.amount);
    await this.ctx.cardRepo.save(card);

    if (totalReward > 0) {
      await this.ctx.awardCurrencyUseCase.execute({
        userId: session.userId,
        amount: totalReward,
        currencyType: CURRENCY_TYPES.CRAFTING_SHARDS,
        source: CURRENCY_SOURCES.DECRAFTING
      });
    }

    return {
      cardId: input.cardId,
      craftingShardsGained: totalReward,
      copiesDecrafted: input.amount
    };
  }
}
