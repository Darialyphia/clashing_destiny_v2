import type { UseCase } from '../../usecase';
import type { AuthSession } from '../../auth/entities/session.entity';
import { ensureAuthenticated } from '../../auth/auth.utils';
import { AppError, DomainError } from '../../utils/error';
import type { CardRepository } from '../repositories/card.repository';
import type { WalletRepository } from '../../currency/repositories/wallet.repository';
import type { EventEmitter } from '../../shared/eventEmitter';
import type { CardId } from '../entities/card.entity';
import { assert, isDefined } from '@game/shared';
import { CURRENCY_SOURCES, CURRENCY_TYPES } from '../../currency/currency.constants';
import type { AwardCurrencyUseCase } from '../../currency/usecases/awardCurrency.usecase';
import { CardDecraftedEvent } from '../events/cardDecrafted.event';

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
      new DomainError('you are not the owner of this card')
    );

    assert(input.amount > 0, new DomainError('Must decraft at least one copy'));
    assert(
      card.copiesOwned.value >= input.amount,
      new DomainError(
        `Cannot decraft ${input.amount} copies of ${card.blueprintId}. Only ${card.copiesOwned.value} available`
      )
    );

    const totalReward = card.decraftRewardPerCopy * input.amount;

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

    this.ctx.eventEmitter.emit(
      CardDecraftedEvent.EVENT_NAME,
      new CardDecraftedEvent({
        userId: session.userId,
        cardId: card.id,
        remainingCopies: card.copiesOwned.value
      })
    );

    return {
      cardId: input.cardId,
      craftingShardsGained: totalReward,
      copiesDecrafted: input.amount
    };
  }
}
