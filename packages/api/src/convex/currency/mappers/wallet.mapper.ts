import type { BetterOmit } from '@game/shared';
import type { Wallet, WalletDoc } from '../entities/wallet.entity';

export class WalletMapper {
  static INJECTION_KEY = 'walletMapper' as const;

  toPersistence(wallet: Wallet): BetterOmit<WalletDoc, '_creationTime'> {
    return {
      _id: wallet.id,
      userId: wallet.userId,
      gold: wallet.gold,
      craftingShards: wallet.craftingShards,
      createdAt: wallet.createdAt,
      updatedAt: wallet.updatedAt
    };
  }
}
