/** This file is auto-generated. Do not edit manually.
   * This files export the list of all card ids
   * This file should be used in the api package  to reference card ids
   *  Because referencing the full card dictionary seems to cause some circular dependency issues with convex
   */
import type { Rarity } from '../card/card.enums';
export const cards = {
"erina": "erina",
"sample": "sample",
"careful_study": "careful_study",
"sample2": "sample2",
"fire-bolt": "fire-bolt",
"frost-shock": "frost-shock",
"wizard-tutor": "wizard-tutor",
"mana-fueled-golem": "mana-fueled-golem",
"apprentice-magician": "apprentice-magician",
"arcane-master": "arcane-master",
"orb-ponderer": "orb-ponderer",
"gargoyle": "gargoyle"
} as const;

export const collectableCards = {
"erina": "erina",
"sample": "sample",
"careful_study": "careful_study",
"sample2": "sample2",
"fire-bolt": "fire-bolt",
"frost-shock": "frost-shock",
"wizard-tutor": "wizard-tutor",
"mana-fueled-golem": "mana-fueled-golem",
"apprentice-magician": "apprentice-magician",
"arcane-master": "arcane-master",
"orb-ponderer": "orb-ponderer",
"gargoyle": "gargoyle"
} as const;

type CardSet = Array<{id: string; collectable: boolean; rarity: Rarity }>;
export const cardsBySet: Record<string, CardSet> = {
"CORE": [
  {
    "id": "erina",
    "collectable": true,
    "rarity": "common"
  },
  {
    "id": "sample",
    "collectable": true,
    "rarity": "common"
  },
  {
    "id": "careful_study",
    "collectable": true,
    "rarity": "common"
  },
  {
    "id": "sample2",
    "collectable": true,
    "rarity": "common"
  },
  {
    "id": "fire-bolt",
    "collectable": true,
    "rarity": "common"
  },
  {
    "id": "frost-shock",
    "collectable": true,
    "rarity": "common"
  },
  {
    "id": "wizard-tutor",
    "collectable": true,
    "rarity": "common"
  },
  {
    "id": "mana-fueled-golem",
    "collectable": true,
    "rarity": "common"
  },
  {
    "id": "apprentice-magician",
    "collectable": true,
    "rarity": "common"
  },
  {
    "id": "arcane-master",
    "collectable": true,
    "rarity": "rare"
  },
  {
    "id": "orb-ponderer",
    "collectable": true,
    "rarity": "rare"
  },
  {
    "id": "gargoyle",
    "collectable": true,
    "rarity": "common"
  }
]
};

export const cardShortIds: Record<string, number> = {
"erina": 2,
"sample": 1,
"careful_study": 3,
"sample2": 4,
"fire-bolt": 5,
"frost-shock": 6,
"wizard-tutor": 7,
"mana-fueled-golem": 8,
"apprentice-magician": 9,
"arcane-master": 10,
"orb-ponderer": 11,
"gargoyle": 12
} as const;

export const cardIdByShortId: Record<number, string> = {
"1": "sample",
"2": "erina",
"3": "careful_study",
"4": "sample2",
"5": "fire-bolt",
"6": "frost-shock",
"7": "wizard-tutor",
"8": "mana-fueled-golem",
"9": "apprentice-magician",
"10": "arcane-master",
"11": "orb-ponderer",
"12": "gargoyle"
} as const;