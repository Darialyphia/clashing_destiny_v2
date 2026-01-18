import { assert } from '@game/shared';
import type { Doc, Id } from '../../_generated/dataModel';
import { Entity } from '../../shared/entity';
import { DomainError } from '../../utils/error';
import type { UserId } from '../../users/entities/user.entity';

export type WalletId = Id<'wallets'>;
export type WalletDoc = Doc<'wallets'>;

export class Wallet extends Entity<WalletId, WalletDoc> {
  canAfford(amount: number): boolean {
    return this.data.gold >= amount;
  }

  get userId() {
    return this.data.userId as UserId;
  }

  get gold() {
    return this.data.gold;
  }

  get createdAt() {
    return this.data.createdAt;
  }

  get updatedAt() {
    return this.data.updatedAt;
  }

  grant(amount: number): void {
    assert(amount > 0, new DomainError('Grant amount must be positive'));
    this.data.gold += amount;
    this.data.updatedAt = Date.now();
  }

  spend(amount: number): void {
    assert(amount > 0, new DomainError('Spend amount must be positive'));
    assert(this.canAfford(amount), new DomainError('Insufficient gold'));
    this.data.gold -= amount;
    this.data.updatedAt = Date.now();
  }
}
