import type { DatabaseReader } from '../../_generated/server';
import type { UserId } from '../../users/entities/user.entity';
import type { Wallet } from '../entities/wallet.entity';

export class WalletReadRepository {
  static INJECTION_KEY = 'walletReadRepo' as const;

  constructor(private ctx: { db: DatabaseReader }) {}

  async getByUserId(userId: UserId): Promise<Wallet | null> {
    const wallet = await this.ctx.db
      .query('wallets')
      .withIndex('by_user', q => q.eq('userId', userId))
      .first();

    return wallet;
  }

  async getBalances(userId: UserId): Promise<{ gold: number }> {
    const wallet = await this.getByUserId(userId);
    return {
      gold: wallet?.gold ?? 0
    };
  }
}
