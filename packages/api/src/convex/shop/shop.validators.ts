import { v } from 'convex/values';
import { SHOP_CATEGORIES } from './shop.constants';

export const SHOP_CATEGORY_VALIDATOR = v.union(
  v.literal(SHOP_CATEGORIES.BOOSTER_PACKS.id),
  v.literal(SHOP_CATEGORIES.BUNDLES.id),
  v.literal(SHOP_CATEGORIES.CARD_SKINS.id),
  v.literal(SHOP_CATEGORIES.ALT_ARTS.id),
  v.literal(SHOP_CATEGORIES.FOIL_EFFECTS.id),
  v.literal(SHOP_CATEGORIES.AVATARS.id),
  v.literal(SHOP_CATEGORIES.EMOTES.id),
  v.literal(SHOP_CATEGORIES.STARTER_DECKS.id)
);
