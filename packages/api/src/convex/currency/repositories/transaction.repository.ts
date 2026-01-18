import type { DatabaseWriter } from '../../_generated/server';
import {
  CurrencyTransaction,
  type TransactionDoc,
  type TransactionId
} from '../entities/transaction.entity';
import type { UserId } from '../../users/entities/user.entity';
import type { CurrencySource, CurrencyType } from '../currency.constants';

export interface CreateTransactionData {
  userId: UserId;
  currencyType: CurrencyType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  source: CurrencySource;
  sourceId?: string;
  metadata?: any;
}

export class TransactionRepository {
  static INJECTION_KEY = 'transactionRepo' as const;

  constructor(private ctx: { db: DatabaseWriter }) {}

  private buildEntity(doc: TransactionDoc) {
    return new CurrencyTransaction(doc._id, doc);
  }

  async getById(transactionId: TransactionId): Promise<CurrencyTransaction | null> {
    const doc = await this.ctx.db.get(transactionId);
    if (!doc) return null;

    return this.buildEntity(doc);
  }

  async create(data: CreateTransactionData): Promise<TransactionId> {
    const transactionId = await this.ctx.db.insert('currencyTransactions', {
      userId: data.userId,
      currencyType: data.currencyType,
      amount: data.amount,
      balanceBefore: data.balanceBefore,
      balanceAfter: data.balanceAfter,
      source: data.source,
      sourceId: data.sourceId,
      metadata: data.metadata,
      createdAt: Date.now()
    });

    return transactionId;
  }
}
