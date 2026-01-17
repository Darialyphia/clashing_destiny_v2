import type { Doc, Id } from '../../_generated/dataModel';
import type { UserId } from '../../users/entities/user.entity';
import type { CurrencySource, CurrencyType } from '../currency.constants';

export type TransactionId = Id<'currencyTransactions'>;
export type TransactionDoc = Doc<'currencyTransactions'>;

export interface CurrencyTransaction {
  _id: TransactionId;
  userId: UserId;
  currencyType: CurrencyType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  source: CurrencySource;
  sourceId?: string;
  metadata?: any;
  createdAt: number;
}
