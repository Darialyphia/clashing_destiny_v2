import type { Rarity } from '../card.enums';

export type BoosterPackOptions = {
  packSize: number;
  blueprintWeightModifier: (blueprintId: string) => number;
  rarityWeightModifier: (rarity: Rarity) => number;
};
export type BoosterPack = {
  getContents: (options: BoosterPackOptions) => Array<{
    blueprintId: string;
    isFoil: boolean;
  }>;
};
