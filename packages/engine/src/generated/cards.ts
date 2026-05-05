/** This file is auto-generated. Do not edit manually.
   * This files export the list of all card ids
   * This file should be used in the api package  to reference card ids
   *  Because referencing the full card dictionary seems to cause some circular dependency issues with convex
   */
import type { Rarity } from '../card/card.enums';
export const cards = {
"sample": "sample",
"erina-violet-witch": "erina-violet-witch",
"sample2": "sample2",
"sampleSpell": "sampleSpell",
"healing_mystic": "healing_mystic",
"fireBolt": "fireBolt"
} as const;

export const collectableCards = {
"sample": "sample",
"erina-violet-witch": "erina-violet-witch",
"sample2": "sample2",
"sampleSpell": "sampleSpell",
"healing_mystic": "healing_mystic",
"fireBolt": "fireBolt"
} as const;

type CardSet = Array<{id: string; collectable: boolean; rarity: Rarity }>;
export const cardsBySet: Record<string, CardSet> = {
"CORE": [
  {
    "id": "sample",
    "collectable": true,
    "rarity": "common"
  },
  {
    "id": "sample",
    "collectable": true,
    "rarity": "common"
  },
  {
    "id": "erina-violet-witch",
    "collectable": true,
    "rarity": "epic"
  },
  {
    "id": "erina-violet-witch",
    "collectable": true,
    "rarity": "epic"
  },
  {
    "id": "sample",
    "collectable": true,
    "rarity": "common"
  },
  {
    "id": "sample2",
    "collectable": true,
    "rarity": "common"
  },
  {
    "id": "sampleSpell",
    "collectable": true,
    "rarity": "common"
  },
  {
    "id": "healing_mystic",
    "collectable": true,
    "rarity": "common"
  },
  {
    "id": "fireBolt",
    "collectable": true,
    "rarity": "common"
  }
]
};

export const cardShortIds: Record<string, number> = {
"sample": 1,
"erina-violet-witch": 7,
"sample2": 8,
"sampleSpell": 9,
"healing_mystic": 10,
"fireBolt": 11
} as const;

export const cardIdByShortId: Record<number, string> = {
"1": "sample",
"7": "erina-violet-witch",
"8": "sample2",
"9": "sampleSpell",
"10": "healing_mystic",
"11": "fireBolt"
} as const;