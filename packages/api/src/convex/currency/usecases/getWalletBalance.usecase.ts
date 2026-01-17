import type { UseCase } from '../../usecase';
import type { UserId } from '../../users/entities/user.entity';
import type { AuthSession } from '../../auth/entities/session.entity';
import { ensureAuthenticated } from '../../auth/auth.utils';
import type { WalletReadRepository } from '../repositories/wallet-read.repository';

export interface GetWalletBalanceInput {
  userId?: UserId;
}

export interface GetWalletBalanceOutput {
  gold: number;
}

export class GetWalletBalanceUseCase
  implements UseCase<GetWalletBalanceInput, GetWalletBalanceOutput>
{
  static INJECTION_KEY = 'getWalletBalanceUseCase' as const;

  constructor(
    protected ctx: {
      walletReadRepo: WalletReadRepository;
      session: AuthSession | null;
    }
  ) {}

  async execute(input: GetWalletBalanceInput): Promise<GetWalletBalanceOutput> {
    const session = ensureAuthenticated(this.ctx.session);

    const userId = input.userId ?? session.userId;

    const balances = await this.ctx.walletReadRepo.getBalances(userId);

    return balances;
  }
}
