import type { UseCase } from '../../usecase';
import type { AuthSession } from '../../auth/entities/session.entity';
import type { CurrencyType } from '../currency.constants';
import { CURRENCY_TYPES, CURRENCY_SOURCES } from '../currency.constants';
import type { WalletRepository } from '../repositories/wallet.repository';
import type { TransactionRepository } from '../repositories/transaction.repository';
import type { EventEmitter } from '../../shared/eventEmitter';
import { CurrencySpentEvent } from '../events/currencySpent.event';
import { AppError, DomainError } from '../../utils/error';
import { ensureAuthenticated } from '../../auth/auth.utils';
import { assert } from '@game/shared';

export interface SpendCurrencyInput {
  amount: number;
  currencyType: CurrencyType;
  purpose: string;
  metadata?: any;
}

export interface SpendCurrencyOutput {
  newBalance: number;
}

export class SpendCurrencyUseCase
  implements UseCase<SpendCurrencyInput, SpendCurrencyOutput>
{
  static INJECTION_KEY = 'spendCurrencyUseCase' as const;

  constructor(
    protected ctx: {
      walletRepo: WalletRepository;
      transactionRepo: TransactionRepository;
      eventEmitter: EventEmitter;
      session: AuthSession | null;
    }
  ) {}

  async execute(input: SpendCurrencyInput): Promise<SpendCurrencyOutput> {
    const session = ensureAuthenticated(this.ctx.session);

    if (input.amount <= 0) {
      throw new AppError('Spend amount must be positive');
    }

    const userId = session.userId;

    const wallet = await this.ctx.walletRepo.getByUserId(userId);
    if (!wallet) {
      throw new AppError('Wallet not found');
    }

    assert(wallet.canAfford(input.amount), new DomainError('Insufficient funds'));

    const balanceBefore = wallet.gold;
    wallet.spend(input.amount, input.currencyType);
    await this.ctx.walletRepo.save(wallet);

    const balanceAfter = balanceBefore - input.amount;

    await this.ctx.transactionRepo.create({
      userId,
      currencyType: input.currencyType,
      amount: -input.amount,
      balanceBefore,
      balanceAfter,
      source: CURRENCY_SOURCES.SPEND,
      metadata: {
        purpose: input.purpose,
        ...input.metadata
      }
    });

    await this.ctx.eventEmitter.emit(
      CurrencySpentEvent.EVENT_NAME,
      new CurrencySpentEvent({
        userId,
        amount: input.amount,
        currencyType: input.currencyType,
        purpose: input.purpose,
        newBalance: balanceAfter
      })
    );

    return { newBalance: balanceAfter };
  }
}
