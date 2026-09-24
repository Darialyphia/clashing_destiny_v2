import type { Values } from '@game/shared';

export const SHOP_CATEGORIES = {
  BOOSTER_PACKS: 'booster_packs',
  BUNDLES: 'bundles'
} as const;

export type ShopCategory = Values<typeof SHOP_CATEGORIES>;
