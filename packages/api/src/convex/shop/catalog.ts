import type { PackType } from '../card/card.constants';
import { CURRENCY_TYPES, type CurrencyType } from '../currency/currency.constants';
import type { AvailabilityRule } from './rules/availability.rule';
import { PurchaseLimitRule } from './rules/purchaseLimit.rule';
import { SHOP_CATEGORIES, type ShopCategory } from './shop.constants';

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
  category: ShopCategory;
  name: string;
  description: string;
  icon: string;

  quantity: {
    min: number;
    max: number;
  };

  price: Array<{
    currency: CurrencyType;
    amount: number;
  }>;

  hot: boolean;
  availability: AvailabilityRule[];
  purchaseLimits: PurchaseLimitRule[];
};

type ShopCatalogEntry<K extends string> = Omit<ShopOffer, 'sku'> & {
  sku: K;
};

export const shopCatalog: ShopCatalogEntry<string>[] = [
  {
    sku: 'core_booster_pack_1',
    category: SHOP_CATEGORIES.BOOSTER_PACKS,
    name: 'Core Booster Pack X 1',
    description: 'Contains 1 Core Standard Booster Pack.',
    icon: 'core_booster_pack_1_icon',
    hot: false,
    price: [
      {
        currency: CURRENCY_TYPES.GOLD,
        amount: 100
      },
      {
        currency: CURRENCY_TYPES.PREMIUM,
        amount: 100
      }
    ],
    quantity: {
      min: 1,
      max: 1
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
  {
    sku: 'core_booster_pack_10',
    category: SHOP_CATEGORIES.BOOSTER_PACKS,
    name: 'Core Booster Pack X 10',
    description: 'Contains 10 Core Standard Booster Packs.',
    icon: 'core_booster_pack_10_icon',
    hot: false,
    price: [
      {
        currency: CURRENCY_TYPES.PREMIUM,
        amount: 950
      }
    ],
    quantity: {
      min: 1,
      max: 1
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
  {
    sku: 'alpha_welcome_bundle',
    category: SHOP_CATEGORIES.BUNDLES,
    name: 'Welcome Bundle',
    description: 'Contains 20 Core Standard Booster Packs and 3000 Crafting Shards.',
    icon: 'alpha_welcome_bundle_icon',
    hot: true,
    price: [
      {
        currency: CURRENCY_TYPES.GOLD,
        amount: 0
      }
    ],
    quantity: {
      min: 1,
      max: 1
    },
    contents: [
      {
        type: 'boosterPack',
        packType: 'CORE_STANDARD',
        quantity: 20
      },
      {
        type: 'currency',
        currencyType: CURRENCY_TYPES.CRAFTING_SHARDS,
        amount: 3000
      }
    ],
    availability: [],
    purchaseLimits: [
      new PurchaseLimitRule({ type: 'lifetime', max: 1 }, 'alpha_welcome_bundle')
    ]
  }
];
