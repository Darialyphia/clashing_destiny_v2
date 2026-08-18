import type { UseCase } from '../../usecase';
import type { AuthSession } from '../../auth/entities/session.entity';
import type { CurrencyType } from '../currency.constants';
import { ensureAuthenticated } from '../../auth/auth.utils';
import { SpendingAmount } from '../spendingAmount';
import type { CurrencyService } from '../services/currency.service';

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
      currencyService: CurrencyService;
      session: AuthSession | null;
    }
  ) {}

  async execute(input: SpendCurrencyInput): Promise<SpendCurrencyOutput> {
    const session = ensureAuthenticated(this.ctx.session);

    const amount = new SpendingAmount(input.amount);
    const userId = session.userId;

    const { newBalance } = await this.ctx.currencyService.spend({
      userId,
      amount,
      currencyType: input.currencyType,
      purpose: input.purpose,
      metadata: input.metadata
    });

    return { newBalance };
  }
}
