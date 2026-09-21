import type { PackType } from '../card/card.constants';
import type { CurrencyType } from '../currency/currency.constants';
import type { AvailabilityRule } from './valueObjects/availabilityRule';
import { PurchaseLimit } from './entities/purchaseLimit';

export type ShopReward =
  | {
      type: 'boosterPack';
      packType: PackType;
      quantity: number;
    }
  | {
      type: 'currency';
      currencyType: CurrencyType;
      amount: number;
    };

export type ShopOffer = {
  sku: string;
  contents: ShopReward[];

  name: string;
  icon: string;
  cover: string;

  price: {
    currency: CurrencyType;
    amount: number;
  };

  availability: AvailabilityRule[];
  purchaseLimits: PurchaseLimit[];
};

type ShopCatalogEntry<K extends string> = Omit<ShopOffer, 'sku'> & {
  sku: K;
};

function defineShopCatalog<const T extends Record<string, ShopOffer>>(
  catalog: T & {
    [K in keyof T]: ShopCatalogEntry<K & string>;
  }
): T {
  return catalog;
}

export const shopCatalog = defineShopCatalog({
  core_booster_pack_1: {
    sku: 'core_booster_pack_1',
    name: 'Core Booster Pack X 1',
    icon: 'core_booster_pack_1_icon.png',
    cover: 'core_booster_pack_1_cover.png',
    price: {
      currency: 'gold',
      amount: 100
    },
    contents: [
      {
        type: 'boosterPack',
        packType: 'CORE_STANDARD',
        quantity: 1
      }
    ],
    availability: [],
    purchaseLimits: []
  },
  core_booster_pack_10: {
    sku: 'core_booster_pack_10',
    name: 'Core Booster Pack X 10',
    icon: 'core_booster_pack_10_icon.png',
    cover: 'core_booster_pack_10_cover.png',
    price: {
      currency: 'gold',
      amount: 1000
    },
    contents: [
      {
        type: 'boosterPack',
        packType: 'CORE_STANDARD',
        quantity: 10
      }
    ],
    availability: [],
    purchaseLimits: []
  },
  alpha_welcome_bundle: {
    sku: 'alpha_welcome_bundle',
    name: 'Clash of Destiny Alpha Welcome Bundle',
    icon: 'alpha_welcome_bundle_icon.png',
    cover: 'alpha_welcome_bundle_cover.png',
    price: {
      currency: 'gold',
      amount: 0
    },
    contents: [
      {
        type: 'boosterPack',
        packType: 'CORE_STANDARD',
        quantity: 5
      },
      {
        type: 'currency',
        currencyType: 'gold',
        amount: 500
      }
    ],
    availability: [],
    purchaseLimits: [
      new PurchaseLimit({ type: 'lifetime', max: 1 }, 'alpha_welcome_bundle')
    ]
  }
});
