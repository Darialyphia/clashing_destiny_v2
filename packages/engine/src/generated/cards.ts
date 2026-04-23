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
"gargoyle": "gargoyle",
"cosmic-avatar": "cosmic-avatar",
"lightning-strike": "lightning-strike",
"fire_mastery": "fire_mastery",
"fire-ball": "fire-ball",
"shooting_star": "shooting_star",
"amplify-magic": "amplify-magic",
"elemental-wisdom": "elemental-wisdom",
"fire-shard": "fire-shard",
"water-shard": "water-shard",
"air-shard": "air-shard",
"earth-shard": "earth-shard",
"elementalist_path": "elementalist_path",
"wheel_of_the_elements": "wheel_of_the_elements",
"pyromancer": "pyromancer",
"peer-into-the-essence": "peer-into-the-essence",
"conflux_chosen": "conflux_chosen",
"arcane_conduit": "arcane_conduit",
"rainbow_elemental": "rainbow_elemental",
"quicksands": "quicksands",
"wind-shield": "wind-shield",
"twister": "twister",
"earthquake": "earthquake",
"seer-of-the-depths": "seer-of-the-depths",
"elemental_alchemy": "elemental_alchemy",
"healing_mystic": "healing_mystic",
"saberspine-tiger": "saberspine-tiger",
"fire-elemental": "fire-elemental",
"water-elemental": "water-elemental",
"air-elemental": "air-elemental",
"earth-elemental": "earth-elemental",
"primus_fist": "primus_fist",
"cartographer": "cartographer",
"shard_crafter": "shard_crafter",
"prism_invocation": "prism_invocation",
"power_overwhelming": "power_overwhelming",
"ceasefire": "ceasefire",
"the_dead_stay_buried": "the_dead_stay_buried",
"battle_fervor": "battle_fervor"
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
"gargoyle": "gargoyle",
"cosmic-avatar": "cosmic-avatar",
"lightning-strike": "lightning-strike",
"fire_mastery": "fire_mastery",
"fire-ball": "fire-ball",
"shooting_star": "shooting_star",
"amplify-magic": "amplify-magic",
"elemental-wisdom": "elemental-wisdom",
"elementalist_path": "elementalist_path",
"pyromancer": "pyromancer",
"peer-into-the-essence": "peer-into-the-essence",
"conflux_chosen": "conflux_chosen",
"arcane_conduit": "arcane_conduit",
"rainbow_elemental": "rainbow_elemental",
"quicksands": "quicksands",
"earthquake": "earthquake",
"seer-of-the-depths": "seer-of-the-depths",
"elemental_alchemy": "elemental_alchemy",
"healing_mystic": "healing_mystic",
"saberspine-tiger": "saberspine-tiger",
"fire-elemental": "fire-elemental",
"water-elemental": "water-elemental",
"air-elemental": "air-elemental",
"earth-elemental": "earth-elemental",
"primus_fist": "primus_fist",
"cartographer": "cartographer",
"shard_crafter": "shard_crafter",
"prism_invocation": "prism_invocation",
"power_overwhelming": "power_overwhelming",
"ceasefire": "ceasefire",
"the_dead_stay_buried": "the_dead_stay_buried",
"battle_fervor": "battle_fervor"
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
  },
  {
    "id": "cosmic-avatar",
    "collectable": true,
    "rarity": "common"
  },
  {
    "id": "lightning-strike",
    "collectable": true,
    "rarity": "common"
  },
  {
    "id": "fire_mastery",
    "collectable": true,
    "rarity": "rare"
  },
  {
    "id": "fire-ball",
    "collectable": true,
    "rarity": "common"
  },
  {
    "id": "shooting_star",
    "collectable": true,
    "rarity": "rare"
  },
  {
    "id": "amplify-magic",
    "collectable": true,
    "rarity": "common"
  },
  {
    "id": "elemental-wisdom",
    "collectable": true,
    "rarity": "epic"
  },
  {
    "id": "fire-shard",
    "collectable": false,
    "rarity": "common"
  },
  {
    "id": "water-shard",
    "collectable": false,
    "rarity": "common"
  },
  {
    "id": "air-shard",
    "collectable": false,
    "rarity": "common"
  },
  {
    "id": "earth-shard",
    "collectable": false,
    "rarity": "common"
  },
  {
    "id": "elementalist_path",
    "collectable": true,
    "rarity": "rare"
  },
  {
    "id": "wheel_of_the_elements",
    "collectable": false,
    "rarity": "rare"
  },
  {
    "id": "pyromancer",
    "collectable": true,
    "rarity": "common"
  },
  {
    "id": "peer-into-the-essence",
    "collectable": true,
    "rarity": "epic"
  },
  {
    "id": "conflux_chosen",
    "collectable": true,
    "rarity": "legendary"
  },
  {
    "id": "arcane_conduit",
    "collectable": true,
    "rarity": "common"
  },
  {
    "id": "rainbow_elemental",
    "collectable": true,
    "rarity": "common"
  },
  {
    "id": "quicksands",
    "collectable": true,
    "rarity": "common"
  },
  {
    "id": "wind-shield",
    "collectable": false,
    "rarity": "common"
  },
  {
    "id": "twister",
    "collectable": false,
    "rarity": "rare"
  },
  {
    "id": "earthquake",
    "collectable": true,
    "rarity": "common"
  },
  {
    "id": "seer-of-the-depths",
    "collectable": true,
    "rarity": "rare"
  },
  {
    "id": "elemental_alchemy",
    "collectable": true,
    "rarity": "rare"
  },
  {
    "id": "healing_mystic",
    "collectable": true,
    "rarity": "common"
  },
  {
    "id": "saberspine-tiger",
    "collectable": true,
    "rarity": "rare"
  },
  {
    "id": "fire-elemental",
    "collectable": true,
    "rarity": "common"
  },
  {
    "id": "water-elemental",
    "collectable": true,
    "rarity": "common"
  },
  {
    "id": "air-elemental",
    "collectable": true,
    "rarity": "common"
  },
  {
    "id": "earth-elemental",
    "collectable": true,
    "rarity": "common"
  },
  {
    "id": "primus_fist",
    "collectable": true,
    "rarity": "common"
  },
  {
    "id": "cartographer",
    "collectable": true,
    "rarity": "common"
  },
  {
    "id": "shard_crafter",
    "collectable": true,
    "rarity": "epic"
  },
  {
    "id": "prism_invocation",
    "collectable": true,
    "rarity": "rare"
  },
  {
    "id": "power_overwhelming",
    "collectable": true,
    "rarity": "epic"
  },
  {
    "id": "ceasefire",
    "collectable": true,
    "rarity": "epic"
  },
  {
    "id": "the_dead_stay_buried",
    "collectable": true,
    "rarity": "epic"
  },
  {
    "id": "battle_fervor",
    "collectable": true,
    "rarity": "epic"
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
"gargoyle": 12,
"cosmic-avatar": 13,
"lightning-strike": 14,
"fire_mastery": 15,
"fire-ball": 16,
"shooting_star": 17,
"amplify-magic": 18,
"elemental-wisdom": 19,
"fire-shard": 20,
"water-shard": 21,
"air-shard": 22,
"earth-shard": 23,
"elementalist_path": 24,
"wheel_of_the_elements": 25,
"pyromancer": 26,
"peer-into-the-essence": 27,
"conflux_chosen": 28,
"arcane_conduit": 29,
"rainbow_elemental": 30,
"quicksands": 31,
"wind-shield": 32,
"twister": 33,
"earthquake": 34,
"seer-of-the-depths": 35,
"elemental_alchemy": 36,
"healing_mystic": 37,
"saberspine-tiger": 38,
"fire-elemental": 39,
"water-elemental": 40,
"air-elemental": 41,
"earth-elemental": 42,
"primus_fist": 43,
"cartographer": 44,
"shard_crafter": 45,
"prism_invocation": 46,
"power_overwhelming": 47,
"ceasefire": 48,
"the_dead_stay_buried": 49,
"battle_fervor": 50
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
"12": "gargoyle",
"13": "cosmic-avatar",
"14": "lightning-strike",
"15": "fire_mastery",
"16": "fire-ball",
"17": "shooting_star",
"18": "amplify-magic",
"19": "elemental-wisdom",
"20": "fire-shard",
"21": "water-shard",
"22": "air-shard",
"23": "earth-shard",
"24": "elementalist_path",
"25": "wheel_of_the_elements",
"26": "pyromancer",
"27": "peer-into-the-essence",
"28": "conflux_chosen",
"29": "arcane_conduit",
"30": "rainbow_elemental",
"31": "quicksands",
"32": "wind-shield",
"33": "twister",
"34": "earthquake",
"35": "seer-of-the-depths",
"36": "elemental_alchemy",
"37": "healing_mystic",
"38": "saberspine-tiger",
"39": "fire-elemental",
"40": "water-elemental",
"41": "air-elemental",
"42": "earth-elemental",
"43": "primus_fist",
"44": "cartographer",
"45": "shard_crafter",
"46": "prism_invocation",
"47": "power_overwhelming",
"48": "ceasefire",
"49": "the_dead_stay_buried",
"50": "battle_fervor"
} as const;