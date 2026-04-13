/** This file is auto-generated. Do not edit manually.
   * This files export the list of all card ids
   * This file should be used in the api package  to reference card ids
   *  Because referencing the full card dictionary seems to cause some circular dependency issues with convex
   */
import type { Rarity } from '../card/card.enums';
export const cards = {
"erina-violet-witch": "erina-violet-witch",
"sample": "sample"
} as const;

export const collectableCards = {
"erina-violet-witch": "erina-violet-witch",
"sample": "sample"
} as const;

type CardSet = Array<{id: string; collectable: boolean; rarity: Rarity }>;
export const cardsBySet: Record<string, CardSet> = {
"CORE": [
  {
    "id": "erina-violet-witch",
    "collectable": true,
    "rarity": "epic"
  },
  {
    "id": "sample",
    "collectable": true,
    "rarity": "common"
  }
]
};

export const cardShortIds: Record<string, number> = {
"erina-violet-witch": 2,
"sample": 1
} as const;

export const cardIdByShortId: Record<number, string> = {
"1": "sample",
"2": "erina-violet-witch"
} as const;