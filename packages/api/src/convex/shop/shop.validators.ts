import { v } from 'convex/values';
import { SHOP_CATEGORIES } from './shop.constants';

export const SHOP_CATEGORY_VALIDATOR = v.union(
  v.literal(SHOP_CATEGORIES.BOOSTER_PACKS),
  v.literal(SHOP_CATEGORIES.BUNDLES)
);
