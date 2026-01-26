import {
  CARD_DECK_SOURCES,
  CARD_SETS,
  RARITIES,
  type CardDeckSource,
  type CardSetId,
  type Rarity
} from '@game/engine/src/card/card.enums';
import type { BoosterPack } from '@game/engine/src/card/booster/booster';
import { StandardBoosterPack } from '@game/engine/src/card/booster/standard.booster-pack';
import type { Values } from '@game/shared';
import { cardsBySet } from '@game/engine/src/generated/cards';

export const BOOSTER_PACK_STATUS = {
  PENDING: 'pending' as const,
  OPENED: 'opened' as const
} as const;
export type BoosterPackStatus = Values<typeof BOOSTER_PACK_STATUS>;

export type BoosterPackCatalogEntry = {
  id: string;
  set: CardSetId;
  name: string;
  packSize: number;
  packGoldCost: number;
  foilChance: number;
  enabled: boolean;
  getContents: () => ReturnType<BoosterPack['getContents']>;
};
export const BOOSTER_PACKS_CATALOG = {
  CORE_STANDARD: {
    id: 'CORE_STANDARD',
    set: CARD_SETS.CORE,
    name: 'Core Set Standard Booster',
    packSize: 5,
    packGoldCost: 100,
    foilChance: 0.05,
    enabled: true,
    getContents() {
      return new StandardBoosterPack(cardsBySet[this.set]).getContents({
        packSize: this.packSize,
        foilChance: this.foilChance,
        blueprintWeightModifier: () => 1,
        rarityWeightModifier: () => 1
      });
    }
  }
} as const satisfies Record<string, BoosterPackCatalogEntry>;
export type PackType = keyof typeof BOOSTER_PACKS_CATALOG;

export const CRAFTING_COST_PER_RARITY: Record<Rarity, number> = {
  [RARITIES.COMMON]: 20,
  [RARITIES.RARE]: 50,
  [RARITIES.EPIC]: 200,
  [RARITIES.LEGENDARY]: 500,
  [RARITIES.BASIC]: 0,
  [RARITIES.TOKEN]: 0
};

export const FOIL_CRAFTING_COST_MULTIPLIER = 2;

export const DECRAFTING_REWARD_PER_RARITY: Record<Rarity, number> = {
  [RARITIES.COMMON]: 10,
  [RARITIES.RARE]: 25,
  [RARITIES.EPIC]: 100,
  [RARITIES.LEGENDARY]: 250,
  [RARITIES.BASIC]: 0,
  [RARITIES.TOKEN]: 0
};

export const FOIL_DECRAFTING_REWARD_MULTIPLIER = 2;

export const MAX_COPIES_PER_CARD_DECK_SOURCE: Record<CardDeckSource, number> = {
  [CARD_DECK_SOURCES.MAIN_DECK]: 3,
  [CARD_DECK_SOURCES.DESTINY_DECK]: 1
};
