import { assert } from '@game/shared';
import type { Doc, Id } from '../../_generated/dataModel';
import { Entity } from '../../shared/entity';
import { DomainError } from '../../utils/error';
import type { UserId } from '../../users/entities/user.entity';
import { CURRENCY_TYPES, type CurrencyType } from '../currency.constants';

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

  get craftingShards() {
    return this.data.craftingShards;
  }

  get createdAt() {
    return this.data.createdAt;
  }

  get updatedAt() {
    return this.data.updatedAt;
  }

  private grantGold(amount: number): void {
    assert(amount > 0, new DomainError('Grant amount must be positive'));
    this.data.gold += amount;
    this.data.updatedAt = Date.now();
  }

  private grantCraftingShards(amount: number): void {
    assert(amount > 0, new DomainError('Grant amount must be positive'));
    this.data.craftingShards += amount;
    this.data.updatedAt = Date.now();
  }

  grant(amount: number, currencyType: CurrencyType): void {
    if (currencyType === CURRENCY_TYPES.GOLD) {
      this.grantGold(amount);
    } else if (currencyType === CURRENCY_TYPES.CRAFTING_SHARDS) {
      this.grantCraftingShards(amount);
    } else {
      throw new DomainError(`Unsupported currency type: ${currencyType}`);
    }
  }

  private spendGold(amount: number): void {
    assert(amount > 0, new DomainError('Spend amount must be positive'));
    assert(this.canAfford(amount), new DomainError('Insufficient gold'));
    this.data.gold -= amount;
    this.data.updatedAt = Date.now();
  }

  private spendCraftingShards(amount: number): void {
    assert(amount > 0, new DomainError('Spend amount must be positive'));
    assert(
      this.data.craftingShards >= amount,
      new DomainError('Insufficient crafting shards')
    );
    this.data.craftingShards -= amount;
    this.data.updatedAt = Date.now();
  }

  spend(amount: number, currencyType: CurrencyType): void {
    if (currencyType === CURRENCY_TYPES.GOLD) {
      this.spendGold(amount);
    } else if (currencyType === CURRENCY_TYPES.CRAFTING_SHARDS) {
      this.spendCraftingShards(amount);
    } else {
      throw new DomainError(`Unsupported currency type: ${currencyType}`);
    }
  }
}
