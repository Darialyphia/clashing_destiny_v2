/** This file is auto-generated. Do not edit manually.
   * This files export the list of all card ids
   * This file should be used in the api package  to reference card ids
   *  Because referencing the full card dictionary seems to cause some circular dependency issues with convex
   */
import type { Rarity } from '../card/card.enums';
export const cards = {
"erina-violet-witch": "erina-violet-witch",
"healing_mystic": "healing_mystic",
"fireBolt": "fireBolt",
"little_witch": "little_witch",
"pyromancer": "pyromancer",
"fireBall": "fireBall",
"first-aid": "first-aid",
"path-to-discovery": "path-to-discovery",
"cull-the-weak": "cull-the-weak",
"burning-hands": "burning-hands"
} as const;

export const collectableCards = {
"erina-violet-witch": "erina-violet-witch",
"healing_mystic": "healing_mystic",
"fireBolt": "fireBolt",
"little_witch": "little_witch",
"pyromancer": "pyromancer",
"fireBall": "fireBall",
"first-aid": "first-aid",
"path-to-discovery": "path-to-discovery",
"cull-the-weak": "cull-the-weak",
"burning-hands": "burning-hands"
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
    "id": "healing_mystic",
    "collectable": true,
    "rarity": "common"
  },
  {
    "id": "fireBolt",
    "collectable": true,
    "rarity": "common"
  },
  {
    "id": "little_witch",
    "collectable": true,
    "rarity": "common"
  },
  {
    "id": "pyromancer",
    "collectable": true,
    "rarity": "rare"
  },
  {
    "id": "fireBall",
    "collectable": true,
    "rarity": "common"
  },
  {
    "id": "first-aid",
    "collectable": true,
    "rarity": "common"
  },
  {
    "id": "path-to-discovery",
    "collectable": true,
    "rarity": "common"
  },
  {
    "id": "cull-the-weak",
    "collectable": true,
    "rarity": "rare"
  },
  {
    "id": "burning-hands",
    "collectable": true,
    "rarity": "common"
  }
]
};

export const cardShortIds: Record<string, number> = {
"erina-violet-witch": 7,
"healing_mystic": 10,
"fireBolt": 11,
"little_witch": 12,
"pyromancer": 13,
"fireBall": 14,
"first-aid": 15,
"path-to-discovery": 16,
"cull-the-weak": 17,
"burning-hands": 18
} as const;

export const cardIdByShortId: Record<number, string> = {
"7": "erina-violet-witch",
"10": "healing_mystic",
"11": "fireBolt",
"12": "little_witch",
"13": "pyromancer",
"14": "fireBall",
"15": "first-aid",
"16": "path-to-discovery",
"17": "cull-the-weak",
"18": "burning-hands"
} as const;