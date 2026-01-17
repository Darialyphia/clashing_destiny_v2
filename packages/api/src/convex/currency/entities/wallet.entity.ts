import type { Doc, Id } from '../../_generated/dataModel';
import type { UserId } from '../../users/entities/user.entity';
import { AppError } from '../../utils/error';

export type WalletId = Id<'wallets'>;
export type WalletDoc = Doc<'wallets'>;

export interface Wallet {
  _id: WalletId;
  userId: UserId;
  gold: number;
  createdAt: number;
  updatedAt: number;
}

export function canAffordGold(wallet: Wallet, amount: number): boolean {
  return wallet.gold >= amount;
}

export function ensureCanAffordGold(wallet: Wallet, amount: number): void {
  if (!canAffordGold(wallet, amount)) {
    throw new AppError(
      `Insufficient gold. Required: ${amount}, Available: ${wallet.gold}`
    );
  }
}
