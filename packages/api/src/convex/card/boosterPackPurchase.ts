import { AppError } from '../utils/error';
import {
  BOOSTER_PACKS_CATALOG,
  type BoosterPackCatalogEntry,
  type BoosterPackContents
} from './card.constants';

const MAX_PACKS_PER_PURCHASE = 10;
const MIN_PACKS_PER_PURCHASE = 1;

export class BoosterPackPurchase {
  private packConfig: BoosterPackCatalogEntry;

  private _content: BoosterPackContents | null = null;

  constructor(
    private _quantity: number,
    private _packType: string
  ) {
    if (_quantity < MIN_PACKS_PER_PURCHASE || _quantity > MAX_PACKS_PER_PURCHASE) {
      throw new AppError(
        `Quantity must be between ${MIN_PACKS_PER_PURCHASE} and ${MAX_PACKS_PER_PURCHASE}`
      );
    }
    const packConfig =
      BOOSTER_PACKS_CATALOG[_packType as keyof typeof BOOSTER_PACKS_CATALOG];
    if (!packConfig) {
      throw new AppError(`Unknown pack type: ${_packType}`);
    }
    this.packConfig = packConfig;
  }

  get metadata() {
    return {
      quantity: this._quantity,
      packType: this._packType
    };
  }

  get totalCost(): number {
    return this.packConfig.packGoldCost * this._quantity;
  }

  get content() {
    if (!this._content) {
      throw new AppError('Booster pack content has not been generated yet');
    }
    return this._content;
  }

  generateContent() {
    this._content = this.packConfig.getContents();
  }
}
