import type { UserId } from '../../users/entities/user.entity';
import type { CurrencyType } from '../currency.constants';
import type { TransactionId } from '../entities/transaction.entity';

export class CurrencySpentEvent {
  static EVENT_NAME = 'currencySpent' as const;

  constructor(
    readonly data: {
      userId: UserId;
      amount: number;
      currencyType: CurrencyType;
      purpose: string;
      transactionId: TransactionId;
      newBalance: number;
    }
  ) {}
}
