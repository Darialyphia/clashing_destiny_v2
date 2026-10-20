import type { Values } from '@game/shared';

export const SHOP_CATEGORIES = {
  BOOSTER_PACKS: 'booster_packs',
  BUNDLES: 'bundles',
  CARD_SKINS: 'card_skins',
  ALT_ARTS: 'alt_arts',
  FOIL_EFFECTS: 'foil_effects',
  AVATARS: 'avatars',
  EMOTES: 'emotes'
} as const;

export type ShopCategory = Values<typeof SHOP_CATEGORIES>;
