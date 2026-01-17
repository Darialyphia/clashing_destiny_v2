import type { DatabaseWriter } from '../../_generated/server';
import type { UserId } from '../../users/entities/user.entity';
import type { Wallet, WalletId } from '../entities/wallet.entity';
import { AppError } from '../../utils/error';

export class WalletRepository {
  static INJECTION_KEY = 'walletRepo' as const;

  constructor(private ctx: { db: DatabaseWriter }) {}

  async create(userId: UserId): Promise<WalletId> {
    const existing = await this.ctx.db
      .query('wallets')
      .withIndex('by_user', q => q.eq('userId', userId))
      .first();

    if (existing) {
      throw new AppError('Wallet already exists for this user');
    }

    const walletId = await this.ctx.db.insert('wallets', {
      userId,
      gold: 0,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

    return walletId as WalletId;
  }

  async getOrCreate(userId: UserId): Promise<Wallet> {
    const existing = await this.ctx.db
      .query('wallets')
      .withIndex('by_user', q => q.eq('userId', userId))
      .first();

    if (existing) {
      return existing;
    }

    const walletId = await this.ctx.db.insert('wallets', {
      userId,
      gold: 0,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

    const wallet = await this.ctx.db.get(walletId);
    if (!wallet) {
      throw new AppError('Failed to create wallet');
    }

    return wallet;
  }

  async addGold(userId: UserId, amount: number): Promise<void> {
    if (amount < 0) {
      throw new AppError('Amount must be positive');
    }

    const wallet = await this.ctx.db
      .query('wallets')
      .withIndex('by_user', q => q.eq('userId', userId))
      .first();

    if (!wallet) {
      throw new AppError('Wallet not found');
    }

    await this.ctx.db.patch(wallet._id, {
      gold: wallet.gold + amount,
      updatedAt: Date.now()
    });
  }

  async subtractGold(userId: UserId, amount: number): Promise<void> {
    if (amount < 0) {
      throw new AppError('Amount must be positive');
    }

    const wallet = await this.ctx.db
      .query('wallets')
      .withIndex('by_user', q => q.eq('userId', userId))
      .first();

    if (!wallet) {
      throw new AppError('Wallet not found');
    }

    if (wallet.gold < amount) {
      throw new AppError(
        `Insufficient gold. Required: ${amount}, Available: ${wallet.gold}`
      );
    }

    await this.ctx.db.patch(wallet._id, {
      gold: wallet.gold - amount,
      updatedAt: Date.now()
    });
  }

  async getByUserId(userId: UserId): Promise<Wallet | null> {
    return await this.ctx.db
      .query('wallets')
      .withIndex('by_user', q => q.eq('userId', userId))
      .first();
  }
}
