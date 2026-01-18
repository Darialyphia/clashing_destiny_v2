import type { DatabaseReader } from '../../_generated/server';
import type { UserId } from '../../users/entities/user.entity';
import type { TransactionDoc } from '../entities/transaction.entity';
import type { CurrencySource, CurrencyType } from '../currency.constants';

export class TransactionReadRepository {
  static INJECTION_KEY = 'transactionReadRepo' as const;

  constructor(private ctx: { db: DatabaseReader }) {}

  async getByUserId(
    userId: UserId,
    options?: {
      limit?: number;
    }
  ): Promise<TransactionDoc[]> {
    const limit = options?.limit ?? 50;

    return await this.ctx.db
      .query('currencyTransactions')
      .withIndex('by_user_created', q => q.eq('userId', userId))
      .order('desc')
      .take(limit);
  }

  async getBySource(
    source: CurrencySource,
    sourceId?: string
  ): Promise<TransactionDoc[]> {
    return await this.ctx.db
      .query('currencyTransactions')
      .withIndex('by_source', q => q.eq('source', source).eq('sourceId', sourceId))
      .collect();
  }

  async getTotalEarned(userId: UserId, currencyType: CurrencyType): Promise<number> {
    const transactions = await this.ctx.db
      .query('currencyTransactions')
      .withIndex('by_user_currency', q =>
        q.eq('userId', userId).eq('currencyType', currencyType)
      )
      .collect();

    return transactions.reduce((total, tx) => {
      return tx.amount > 0 ? total + tx.amount : total;
    }, 0);
  }

  async getTotalSpent(userId: UserId, currencyType: CurrencyType): Promise<number> {
    const transactions = await this.ctx.db
      .query('currencyTransactions')
      .withIndex('by_user_currency', q =>
        q.eq('userId', userId).eq('currencyType', currencyType)
      )
      .collect();

    return transactions.reduce((total, tx) => {
      return tx.amount < 0 ? total + Math.abs(tx.amount) : total;
    }, 0);
  }
}
