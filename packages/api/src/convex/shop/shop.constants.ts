import type { Values } from '@game/shared';

export type ShopCateogry = {
  id: string;
  name: string;
  description: string;
};

export const SHOP_CATEGORIES = {
  BOOSTER_PACKS: {
    id: 'booster_packs',
    name: 'Booster Packs',
    description: 'Expand your collection with booster packs.'
  },
  STARTER_DECKS: {
    id: 'starter_decks',
    name: 'Starter Decks',
    description: 'Get started with a ready-to-play deck.'
  },
  BUNDLES: {
    id: 'bundles',
    name: 'Bundles',
    description: 'Curated offers at an unbeatable price.'
  },
  CARD_SKINS: {
    id: 'card_skins',
    name: 'Card Skins',
    description: 'Restyle your cards with new frames.'
  },
  ALT_ARTS: {
    id: 'alt_arts',
    name: 'Alt Arts',
    description: 'Pimp up your cards with epic artwork.'
  },
  FOIL_EFFECTS: {
    id: 'foil_effects',
    name: 'Foil Effects',
    description: 'Stand out with dazzling foil effects.'
  },
  AVATARS: {
    id: 'avatars',
    name: 'Avatars',
    description: 'Show off your style with a new face on the battlefield.'
  },
  EMOTES: {
    id: 'emotes',
    name: 'Emotes',
    description: 'Taunt, cheer, or say good game with expressive reactions.'
  }
} as const satisfies Record<string, ShopCateogry>;

export type ShopCategory = Values<typeof SHOP_CATEGORIES>;
