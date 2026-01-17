import type { UseCase } from '../../usecase';
import type { AuthSession } from '../../auth/entities/session.entity';
import { ensureAuthenticated } from '../../auth/auth.utils';
import type { TransactionReadRepository } from '../repositories/transaction-read.repository';
import type { CurrencyTransaction } from '../entities/transaction.entity';

export interface GetTransactionHistoryInput {
  limit?: number;
}

export type GetTransactionHistoryOutput = CurrencyTransaction[];

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

    return transactions;
  }
}
