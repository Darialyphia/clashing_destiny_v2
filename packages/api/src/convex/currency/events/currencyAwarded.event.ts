import type { UserId } from '../../users/entities/user.entity';
import type { CurrencySource, CurrencyType } from '../currency.constants';

export class CurrencyAwardedEvent {
  static EVENT_NAME = 'currencyAwarded' as const;

  constructor(
    readonly data: {
      userId: UserId;
      amount: number;
      currencyType: CurrencyType;
      source: CurrencySource;
      newBalance: number;
    }
  ) {}
}
