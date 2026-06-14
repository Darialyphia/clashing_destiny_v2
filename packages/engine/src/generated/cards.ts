/** This file is auto-generated. Do not edit manually.
   * This files export the list of all card ids
   * This file should be used in the api package  to reference card ids
   *  Because referencing the full card dictionary seems to cause some circular dependency issues with convex
   */
import type { Rarity } from '../card/card.enums';
export const cards = {
"erina-violet-witch": "erina-violet-witch",
"fireBolt": "fireBolt",
"pyromancer": "pyromancer",
"braveCitizen": "braveCitizen",
"recklessRecruit": "recklessRecruit",
"willowisp": "willowisp",
"cremation": "cremation",
"innerFire": "innerFire",
"fireBall": "fireBall",
"engulfInFlames": "engulfInFlames",
"lesserFireSummoning": "lesserFireSummoning",
"day-of-fortitude": "day-of-fortitude",
"day-of-conquest": "day-of-conquest",
"fireImp": "fireImp",
"flameArchmage": "flameArchmage",
"arcaneSight": "arcaneSight",
"conjureMight": "conjureMight",
"conjureWisdom": "conjureWisdom",
"conjureFocus": "conjureFocus",
"conjureResonance": "conjureResonance"
} as const;

export const collectableCards = {
"erina-violet-witch": "erina-violet-witch",
"fireBolt": "fireBolt",
"pyromancer": "pyromancer",
"braveCitizen": "braveCitizen",
"recklessRecruit": "recklessRecruit",
"willowisp": "willowisp",
"cremation": "cremation",
"innerFire": "innerFire",
"fireBall": "fireBall",
"engulfInFlames": "engulfInFlames",
"lesserFireSummoning": "lesserFireSummoning",
"day-of-fortitude": "day-of-fortitude",
"day-of-conquest": "day-of-conquest",
"fireImp": "fireImp",
"flameArchmage": "flameArchmage",
"arcaneSight": "arcaneSight",
"conjureMight": "conjureMight",
"conjureWisdom": "conjureWisdom",
"conjureFocus": "conjureFocus",
"conjureResonance": "conjureResonance"
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
    "id": "fireBolt",
    "collectable": true,
    "rarity": "common"
  },
  {
    "id": "pyromancer",
    "collectable": true,
    "rarity": "common"
  },
  {
    "id": "braveCitizen",
    "collectable": true,
    "rarity": "common"
  },
  {
    "id": "recklessRecruit",
    "collectable": true,
    "rarity": "common"
  },
  {
    "id": "willowisp",
    "collectable": true,
    "rarity": "common"
  },
  {
    "id": "cremation",
    "collectable": true,
    "rarity": "common"
  },
  {
    "id": "innerFire",
    "collectable": true,
    "rarity": "common"
  },
  {
    "id": "fireBall",
    "collectable": true,
    "rarity": "rare"
  },
  {
    "id": "engulfInFlames",
    "collectable": true,
    "rarity": "rare"
  },
  {
    "id": "lesserFireSummoning",
    "collectable": true,
    "rarity": "common"
  },
  {
    "id": "day-of-fortitude",
    "collectable": true,
    "rarity": "common"
  },
  {
    "id": "day-of-conquest",
    "collectable": true,
    "rarity": "common"
  },
  {
    "id": "fireImp",
    "collectable": true,
    "rarity": "common"
  },
  {
    "id": "flameArchmage",
    "collectable": true,
    "rarity": "epic"
  },
  {
    "id": "arcaneSight",
    "collectable": true,
    "rarity": "common"
  },
  {
    "id": "conjureMight",
    "collectable": true,
    "rarity": "rare"
  },
  {
    "id": "conjureWisdom",
    "collectable": true,
    "rarity": "rare"
  },
  {
    "id": "conjureFocus",
    "collectable": true,
    "rarity": "rare"
  },
  {
    "id": "conjureResonance",
    "collectable": true,
    "rarity": "rare"
  }
]
};

export const cardShortIds: Record<string, number> = {
"erina-violet-witch": 1,
"fireBolt": 2,
"pyromancer": 3,
"braveCitizen": 4,
"recklessRecruit": 5,
"willowisp": 6,
"cremation": 7,
"innerFire": 8,
"fireBall": 9,
"engulfInFlames": 10,
"lesserFireSummoning": 11,
"day-of-fortitude": 12,
"day-of-conquest": 13,
"fireImp": 14,
"flameArchmage": 15,
"arcaneSight": 16,
"conjureMight": 17,
"conjureWisdom": 18,
"conjureFocus": 19,
"conjureResonance": 20
} as const;

export const cardIdByShortId: Record<number, string> = {
"1": "erina-violet-witch",
"2": "fireBolt",
"3": "pyromancer",
"4": "braveCitizen",
"5": "recklessRecruit",
"6": "willowisp",
"7": "cremation",
"8": "innerFire",
"9": "fireBall",
"10": "engulfInFlames",
"11": "lesserFireSummoning",
"12": "day-of-fortitude",
"13": "day-of-conquest",
"14": "fireImp",
"15": "flameArchmage",
"16": "arcaneSight",
"17": "conjureMight",
"18": "conjureWisdom",
"19": "conjureFocus",
"20": "conjureResonance"
} as const;