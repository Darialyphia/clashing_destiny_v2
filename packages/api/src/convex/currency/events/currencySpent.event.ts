import type { UserId } from '../../users/entities/user.entity';
import type { CurrencyType } from '../currency.constants';

export class CurrencySpentEvent {
  static EVENT_NAME = 'currencySpent' as const;

  constructor(
    readonly data: {
      userId: UserId;
      amount: number;
      currencyType: CurrencyType;
      purpose: string;
      newBalance: number;
    }
  ) {}
}
