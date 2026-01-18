import type { UseCase } from '../../usecase';
import type { AuthSession } from '../../auth/entities/session.entity';
import { ensureAuthenticated } from '../../auth/auth.utils';
import type { TransactionReadRepository } from '../repositories/transaction-read.repository';
import type { CurrencyTransaction, TransactionId } from '../entities/transaction.entity';
import type { CurrencySource, CurrencyType } from '../currency.constants';

export interface GetTransactionHistoryInput {
  limit?: number;
}

export type GetTransactionHistoryOutput = Array<{
  id: TransactionId;
  currencyType: CurrencyType;
  amount: number;
  source: CurrencySource;
}>;

export class GetTransactionHistoryUseCase
  implements UseCase<GetTransactionHistoryInput, GetTransactionHistoryOutput>
{
  static INJECTION_KEY = 'getTransactionHistoryUseCase' as const;

  constructor(
    protected ctx: {
      transactionReadRepo: TransactionReadRepository;
      session: AuthSession | null;
    }
  ) {}

  async execute(input: GetTransactionHistoryInput): Promise<GetTransactionHistoryOutput> {
    const session = ensureAuthenticated(this.ctx.session);

    const transactions = await this.ctx.transactionReadRepo.getByUserId(session.userId, {
      limit: input.limit ?? 50
    });

    return transactions.map(tx => ({
      id: tx._id,
      currencyType: tx.currencyType,
      amount: tx.amount,
      source: tx.source
    }));
  }
}
