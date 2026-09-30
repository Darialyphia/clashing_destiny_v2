import { assert } from '@game/shared';
import type { Doc, Id } from '../../_generated/dataModel';
import { Entity } from '../../shared/entity';
import { DomainError } from '../../utils/error';
import type { UserId } from '../../users/entities/user.entity';
import { CURRENCY_TYPES, type CurrencyType } from '../currency.constants';
import { match } from 'ts-pattern';

export type WalletId = Id<'wallets'>;
export type WalletDoc = Doc<'wallets'>;

export class Wallet extends Entity<WalletId, WalletDoc> {
  canAfford(amount: number, currency: CurrencyType): boolean {
    return match(currency)
      .with(CURRENCY_TYPES.GOLD, () => this.data.gold >= amount)
      .with(CURRENCY_TYPES.CRAFTING_SHARDS, () => this.data.craftingShards >= amount)
      .with(CURRENCY_TYPES.PREMIUM, () => this.data.premiumCurrency >= amount)
      .exhaustive();
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

  get premiumCurrency() {
    return this.data.premiumCurrency;
  }

  getCurrency(currencyType: CurrencyType): number {
    return match(currencyType)
      .with(CURRENCY_TYPES.GOLD, () => this.gold)
      .with(CURRENCY_TYPES.CRAFTING_SHARDS, () => this.craftingShards)
      .with(CURRENCY_TYPES.PREMIUM, () => this.premiumCurrency)
      .exhaustive();
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

  private grantPremiumCurrency(amount: number): void {
    assert(amount > 0, new DomainError('Grant amount must be positive'));
    this.data.premiumCurrency += amount;
    this.data.updatedAt = Date.now();
  }

  grant(amount: number, currencyType: CurrencyType): void {
    return match(currencyType)
      .with(CURRENCY_TYPES.GOLD, () => this.grantGold(amount))
      .with(CURRENCY_TYPES.CRAFTING_SHARDS, () => this.grantCraftingShards(amount))
      .with(CURRENCY_TYPES.PREMIUM, () => this.grantPremiumCurrency(amount))
      .exhaustive();
  }

  private spendGold(amount: number): void {
    assert(amount >= 0, new DomainError('Spend amount must be positive'));
    assert(
      this.canAfford(amount, CURRENCY_TYPES.GOLD),
      new DomainError('Insufficient gold')
    );
    this.data.gold -= amount;
    this.data.updatedAt = Date.now();
  }

  private spendCraftingShards(amount: number): void {
    assert(amount >= 0, new DomainError('Spend amount must be positive'));
    assert(
      this.canAfford(amount, CURRENCY_TYPES.CRAFTING_SHARDS),
      new DomainError('Insufficient crafting shards')
    );
    this.data.craftingShards -= amount;
    this.data.updatedAt = Date.now();
  }

  private spendPremiumCurrency(amount: number): void {
    assert(amount >= 0, new DomainError('Spend amount must be positive'));
    assert(
      this.canAfford(amount, CURRENCY_TYPES.PREMIUM),
      new DomainError('Insufficient premium currency')
    );
    this.data.premiumCurrency -= amount;
    this.data.updatedAt = Date.now();
  }

  spend(amount: number, currencyType: CurrencyType): void {
    return match(currencyType)
      .with(CURRENCY_TYPES.GOLD, () => this.spendGold(amount))
      .with(CURRENCY_TYPES.CRAFTING_SHARDS, () => this.spendCraftingShards(amount))
      .with(CURRENCY_TYPES.PREMIUM, () => this.spendPremiumCurrency(amount))
      .exhaustive();
  }
}
