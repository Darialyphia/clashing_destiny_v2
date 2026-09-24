import { assert, isDefined } from '@game/shared';
import type { CurrencyType } from '../currency/currency.constants';
import { shopCatalog } from './catalog';
import { DomainError } from '../utils/error';

export class ShopPurchase {
  constructor(
    public readonly sku: string,
    public readonly currencyType: CurrencyType,
    public readonly quantity: number
  ) {
    assert(
      isDefined(this.product),
      new DomainError(`Product with SKU '${this.sku}' not found`)
    );
    assert(
      isDefined(this.totalPrice),
      new DomainError(
        `Cannot purchase item $${this.sku} with currency ${this.currencyType}`
      )
    );
    assert(this.quantity > 0, new DomainError(`Quantity must be greater than 0`));
    assert(
      this.quantity <= this.product!.quantity.max,
      new DomainError(`Quantity must not exceed the maximum allowed for this product`)
    );
    assert(
      this.quantity >= this.product!.quantity.min,
      new DomainError(
        `Quantity must not be less than the minimum allowed for this product`
      )
    );
  }

  get totalPrice() {
    if (!this.product) return null;

    const currencyPrice = this.product.price.find(
      price => price.currency === this.currencyType
    );
    assert(
      isDefined(currencyPrice),
      new DomainError(
        `Cannot purchase item $${this.sku} with currency ${this.currencyType}`
      )
    );

    return currencyPrice!.amount * this.quantity;
  }

  isAvailableAt(date: Date) {
    return (
      isDefined(this.product) &&
      this.product.availability.every(availability => availability.isAvailable(date))
    );
  }

  canPurchase(transactions: Array<{ sku: string; purchasedAt: Date }>) {
    return (
      isDefined(this.product) &&
      this.product.purchaseLimits.every(limit => limit.canPurchase(transactions))
    );
  }

  get product() {
    return shopCatalog.find(product => product.sku === this.sku);
  }

  get metadata() {
    return {
      sku: this.sku,
      content: this.product?.contents,
      quantity: this.quantity
    };
  }
}
