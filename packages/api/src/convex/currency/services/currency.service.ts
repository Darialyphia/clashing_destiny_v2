import { assert } from '@game/shared';
import { AppError, DomainError } from '../../utils/error';
import {
  type CurrencyType,
  CURRENCY_SOURCES,
  CURRENCY_TYPES
} from '../currency.constants';
import { CurrencySpentEvent } from '../events/currencySpent.event';
import { SpendingAmount } from '../spendingAmount';
import type { EventEmitter } from '../../shared/eventEmitter';
import type { TransactionRepository } from '../repositories/transaction.repository';
import type { WalletRepository } from '../repositories/wallet.repository';
import type { UserId } from '../../users/entities/user.entity';
import type { Wallet } from '../entities/wallet.entity';
import { match } from 'ts-pattern';

export class CurrencyService {
  static INJECTION_KEY = 'currencyService' as const;

  constructor(
    protected ctx: {
      walletRepo: WalletRepository;
      transactionRepo: TransactionRepository;
      eventEmitter: EventEmitter;
    }
  ) {}

  private spendGold(wallet: Wallet, amount: number): { before: number; after: number } {
    const balanceBefore = wallet.gold;
    wallet.spend(amount, CURRENCY_TYPES.GOLD);
    this.ctx.walletRepo.save(wallet);
    const balanceAfter = balanceBefore - amount;
    return {
      before: balanceBefore,
      after: balanceAfter
    };
  }

  private spendCraftingShards(
    wallet: Wallet,
    amount: number
  ): { before: number; after: number } {
    const balanceBefore = wallet.craftingShards;
    wallet.spend(amount, CURRENCY_TYPES.CRAFTING_SHARDS);
    this.ctx.walletRepo.save(wallet);
    const balanceAfter = balanceBefore - amount;
    return {
      before: balanceBefore,
      after: balanceAfter
    };
  }

  async spend({
    userId,
    amount,
    currencyType,
    purpose,
    metadata
  }: {
    userId: UserId;
    amount: SpendingAmount;
    currencyType: CurrencyType;
    purpose: string;
    metadata?: any;
  }): Promise<{ newBalance: number }> {
    const wallet = await this.ctx.walletRepo.getByUserId(userId);
    if (!wallet) {
      throw new AppError('Wallet not found');
    }

    assert(
      wallet.canAfford(amount.value, currencyType),
      new DomainError('Insufficient funds')
    );

    const { before: balanceBefore, after: balanceAfter } = match(currencyType)
      .with(CURRENCY_TYPES.GOLD, () => {
        return this.spendGold(wallet, amount.value);
      })
      .with(CURRENCY_TYPES.CRAFTING_SHARDS, () => {
        return this.spendCraftingShards(wallet, amount.value);
      })
      .exhaustive();

    await this.ctx.transactionRepo.create({
      userId,
      currencyType: currencyType,
      amount: -amount.value,
      balanceBefore,
      balanceAfter,
      source: CURRENCY_SOURCES.SPEND,
      metadata: {
        purpose: purpose,
        ...metadata
      }
    });

    await this.ctx.eventEmitter.emit(
      CurrencySpentEvent.EVENT_NAME,
      new CurrencySpentEvent({
        userId,
        amount: amount.value,
        currencyType: currencyType,
        purpose: purpose,
        newBalance: balanceAfter
      })
    );

    return { newBalance: balanceAfter };
  }
}
