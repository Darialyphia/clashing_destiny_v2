import type { UseCase } from '../../usecase';
import type { UserId } from '../../users/entities/user.entity';
import type { CurrencySource, CurrencyType } from '../currency.constants';
import { CURRENCY_TYPES } from '../currency.constants';
import type { WalletRepository } from '../repositories/wallet.repository';
import type { TransactionRepository } from '../repositories/transaction.repository';
import type { EventEmitter } from '../../shared/eventEmitter';
import { CurrencyAwardedEvent } from '../events/currencyAwarded.event';
import { AppError } from '../../utils/error';

export interface AwardCurrencyInput {
  userId: UserId;
  amount: number;
  currencyType: CurrencyType;
  source: CurrencySource;
  sourceId?: string;
  metadata?: any;
}

export interface AwardCurrencyOutput {
  newBalance: number;
}

export class AwardCurrencyUseCase
  implements UseCase<AwardCurrencyInput, AwardCurrencyOutput>
{
  static INJECTION_KEY = 'awardCurrencyUseCase' as const;

  constructor(
    protected ctx: {
      walletRepo: WalletRepository;
      transactionRepo: TransactionRepository;
      eventEmitter: EventEmitter;
    }
  ) {}

  async execute(input: AwardCurrencyInput): Promise<AwardCurrencyOutput> {
    if (input.amount <= 0) {
      throw new AppError('Award amount must be positive');
    }

    if (input.currencyType !== CURRENCY_TYPES.GOLD) {
      throw new AppError(`Unsupported currency type: ${input.currencyType}`);
    }

    const wallet = await this.ctx.walletRepo.getOrCreate(input.userId);
    const balanceBefore = wallet.gold;
    wallet.grant(input.amount, input.currencyType);
    await this.ctx.walletRepo.save(wallet);
    const balanceAfter = balanceBefore + input.amount;

    await this.ctx.transactionRepo.create({
      userId: input.userId,
      currencyType: input.currencyType,
      amount: input.amount,
      balanceBefore,
      balanceAfter,
      source: input.source,
      sourceId: input.sourceId,
      metadata: input.metadata
    });

    await this.ctx.eventEmitter.emit(
      CurrencyAwardedEvent.EVENT_NAME,
      new CurrencyAwardedEvent({
        userId: input.userId,
        amount: input.amount,
        currencyType: input.currencyType,
        source: input.source,
        newBalance: balanceAfter
      })
    );

    return { newBalance: balanceAfter };
  }
}
