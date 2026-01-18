import { CARD_SETS, type CardSetId } from '@game/engine/src/card/card.enums';
import type { BoosterPack } from '@game/engine/src/card/booster/booster';
import { StandardBoosterPack } from '@game/engine/src/card/booster/standard.booster-pack';
import type { Values } from '@game/shared';
import { cardsBySet } from '@game/engine/src/generated/cards';

export const BOOSTER_PACK_STATUS = {
  PENDING: 'pending' as const,
  OPENED: 'opened' as const
} as const;
export type BoosterPackStatus = Values<typeof BOOSTER_PACK_STATUS>;

type BoosterPackCatalogEntry = {
  id: string;
  set: CardSetId;
  name: string;
  packSize: number;
  packGoldCost: number;
  foilChance: number;
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
