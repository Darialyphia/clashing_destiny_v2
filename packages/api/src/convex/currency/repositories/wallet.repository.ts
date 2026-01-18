import type { DatabaseWriter } from '../../_generated/server';
import type { UserId } from '../../users/entities/user.entity';
import { Wallet, type WalletDoc, type WalletId } from '../entities/wallet.entity';
import { AppError } from '../../utils/error';
import type { WalletMapper } from '../mappers/wallet.mapper';

export class WalletRepository {
  static INJECTION_KEY = 'walletRepo' as const;

  constructor(private ctx: { db: DatabaseWriter; walletMapper: WalletMapper }) {}

  private buildEntity(doc: WalletDoc) {
    return new Wallet(doc._id, doc);
  }

  async getById(walletId: WalletId): Promise<Wallet | null> {
    const doc = await this.ctx.db.get(walletId);
    if (!doc) return null;

    return this.buildEntity(doc);
  }

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
      return this.buildEntity(existing);
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

    return this.buildEntity(wallet);
  }

  async getByUserId(userId: UserId): Promise<Wallet | null> {
    const doc = await this.ctx.db
      .query('wallets')
      .withIndex('by_user', q => q.eq('userId', userId))
      .first();

    if (!doc) return null;

    return this.buildEntity(doc);
  }

  async save(wallet: Wallet): Promise<void> {
    await this.ctx.db.patch(wallet.id, this.ctx.walletMapper.toPersistence(wallet));
  }
}
