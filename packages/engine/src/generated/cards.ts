/** This file is auto-generated. Do not edit manually.
   * This files export the list of all card ids
   * This file should be used in the api package  to reference card ids
   *  Because referencing the full card dictionary seems to cause some circular dependency issues with convex
   */
import type { Rarity, CardKind } from '../card/card.enums';

export const cards = {
"erina-violet-witch": "erina-violet-witch",
"fireBolt": "fireBolt",
"pyromancer": "pyromancer",
"braveCitizen": "braveCitizen",
"birdOfGoodLuck": "birdOfGoodLuck",
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
"conjureResonance": "conjureResonance",
"arcaneSpark": "arcaneSpark",
"repulsorShield": "repulsorShield",
"fallingStar": "fallingStar",
"starSeer": "starSeer",
"manaWeaverApprentice": "manaWeaverApprentice",
"mysticRecall": "mysticRecall",
"starconvergence": "starconvergence",
"restrain-the-beast": "restrain-the-beast",
"crowds-favor": "crowds-favor",
"manaFueledGolem": "manaFueledGolem",
"erinasApprentice": "erinasApprentice",
"enigmaticWizard": "enigmaticWizard",
"astralBall": "astralBall",
"indomitableVindicator": "indomitableVindicator",
"twinFlame": "twinFlame",
"astralSage": "astralSage",
"harold-vowed-crusader": "harold-vowed-crusader",
"spellSiphon": "spellSiphon"
} as const;

export const collectableCards = {
"erina-violet-witch": "erina-violet-witch",
"fireBolt": "fireBolt",
"pyromancer": "pyromancer",
"braveCitizen": "braveCitizen",
"birdOfGoodLuck": "birdOfGoodLuck",
"recklessRecruit": "recklessRecruit",
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
"conjureResonance": "conjureResonance",
"arcaneSpark": "arcaneSpark",
"repulsorShield": "repulsorShield",
"fallingStar": "fallingStar",
"starSeer": "starSeer",
"manaWeaverApprentice": "manaWeaverApprentice",
"mysticRecall": "mysticRecall",
"starconvergence": "starconvergence",
"restrain-the-beast": "restrain-the-beast",
"crowds-favor": "crowds-favor",
"manaFueledGolem": "manaFueledGolem",
"erinasApprentice": "erinasApprentice",
"enigmaticWizard": "enigmaticWizard",
"indomitableVindicator": "indomitableVindicator",
"twinFlame": "twinFlame",
"astralSage": "astralSage",
"harold-vowed-crusader": "harold-vowed-crusader",
"spellSiphon": "spellSiphon"
} as const;

type CardSet = Array<{id: string; collectable: boolean; rarity: Rarity, kind: CardKind}>;
export const cardsBySet: Record<string, CardSet> = {
"CORE": [
  {
    "id": "erina-violet-witch",
    "collectable": true,
    "rarity": "epic",
    "kind": "HERO"
  },
  {
    "id": "fireBolt",
    "collectable": true,
    "rarity": "common",
    "kind": "SPELL"
  },
  {
    "id": "pyromancer",
    "collectable": true,
    "rarity": "common",
    "kind": "MINION"
  },
  {
    "id": "braveCitizen",
    "collectable": true,
    "rarity": "common",
    "kind": "MINION"
  },
  {
    "id": "birdOfGoodLuck",
    "collectable": true,
    "rarity": "epic",
    "kind": "MINION"
  },
  {
    "id": "recklessRecruit",
    "collectable": true,
    "rarity": "common",
    "kind": "MINION"
  },
  {
    "id": "willowisp",
    "collectable": false,
    "rarity": "common",
    "kind": "MINION"
  },
  {
    "id": "cremation",
    "collectable": true,
    "rarity": "common",
    "kind": "SPELL"
  },
  {
    "id": "innerFire",
    "collectable": true,
    "rarity": "common",
    "kind": "SPELL"
  },
  {
    "id": "fireBall",
    "collectable": true,
    "rarity": "rare",
    "kind": "SPELL"
  },
  {
    "id": "engulfInFlames",
    "collectable": true,
    "rarity": "rare",
    "kind": "SPELL"
  },
  {
    "id": "lesserFireSummoning",
    "collectable": true,
    "rarity": "common",
    "kind": "SPELL"
  },
  {
    "id": "day-of-fortitude",
    "collectable": true,
    "rarity": "common",
    "kind": "DESTINY"
  },
  {
    "id": "day-of-conquest",
    "collectable": true,
    "rarity": "common",
    "kind": "DESTINY"
  },
  {
    "id": "fireImp",
    "collectable": true,
    "rarity": "common",
    "kind": "MINION"
  },
  {
    "id": "flameArchmage",
    "collectable": true,
    "rarity": "epic",
    "kind": "MINION"
  },
  {
    "id": "arcaneSight",
    "collectable": true,
    "rarity": "common",
    "kind": "SPELL"
  },
  {
    "id": "conjureMight",
    "collectable": true,
    "rarity": "rare",
    "kind": "SPELL"
  },
  {
    "id": "conjureWisdom",
    "collectable": true,
    "rarity": "rare",
    "kind": "SPELL"
  },
  {
    "id": "conjureFocus",
    "collectable": true,
    "rarity": "rare",
    "kind": "SPELL"
  },
  {
    "id": "conjureResonance",
    "collectable": true,
    "rarity": "rare",
    "kind": "SPELL"
  },
  {
    "id": "arcaneSpark",
    "collectable": true,
    "rarity": "common",
    "kind": "SPELL"
  },
  {
    "id": "repulsorShield",
    "collectable": true,
    "rarity": "common",
    "kind": "SPELL"
  },
  {
    "id": "fallingStar",
    "collectable": true,
    "rarity": "rare",
    "kind": "SPELL"
  },
  {
    "id": "starSeer",
    "collectable": true,
    "rarity": "common",
    "kind": "MINION"
  },
  {
    "id": "manaWeaverApprentice",
    "collectable": true,
    "rarity": "common",
    "kind": "MINION"
  },
  {
    "id": "mysticRecall",
    "collectable": true,
    "rarity": "common",
    "kind": "SPELL"
  },
  {
    "id": "starconvergence",
    "collectable": true,
    "rarity": "rare",
    "kind": "SPELL"
  },
  {
    "id": "restrain-the-beast",
    "collectable": true,
    "rarity": "common",
    "kind": "DESTINY"
  },
  {
    "id": "crowds-favor",
    "collectable": true,
    "rarity": "common",
    "kind": "DESTINY"
  },
  {
    "id": "manaFueledGolem",
    "collectable": true,
    "rarity": "rare",
    "kind": "MINION"
  },
  {
    "id": "erinasApprentice",
    "collectable": true,
    "rarity": "rare",
    "kind": "MINION"
  },
  {
    "id": "enigmaticWizard",
    "collectable": true,
    "rarity": "epic",
    "kind": "MINION"
  },
  {
    "id": "astralBall",
    "collectable": false,
    "rarity": "token",
    "kind": "MINION"
  },
  {
    "id": "indomitableVindicator",
    "collectable": true,
    "rarity": "rare",
    "kind": "MINION"
  },
  {
    "id": "twinFlame",
    "collectable": true,
    "rarity": "rare",
    "kind": "SPELL"
  },
  {
    "id": "astralSage",
    "collectable": true,
    "rarity": "epic",
    "kind": "MINION"
  },
  {
    "id": "harold-vowed-crusader",
    "collectable": true,
    "rarity": "epic",
    "kind": "HERO"
  },
  {
    "id": "spellSiphon",
    "collectable": true,
    "rarity": "rare",
    "kind": "SPELL"
  }
]
};

export const cardShortIds: Record<string, number> = {
"erina-violet-witch": 1,
"fireBolt": 2,
"pyromancer": 3,
"braveCitizen": 4,
"birdOfGoodLuck": 28,
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
"conjureResonance": 20,
"arcaneSpark": 21,
"repulsorShield": 22,
"fallingStar": 23,
"starSeer": 24,
"manaWeaverApprentice": 25,
"mysticRecall": 26,
"starconvergence": 27,
"restrain-the-beast": 29,
"crowds-favor": 30,
"manaFueledGolem": 31,
"erinasApprentice": 32,
"enigmaticWizard": 33,
"astralBall": 34,
"indomitableVindicator": 35,
"twinFlame": 36,
"astralSage": 37,
"harold-vowed-crusader": 38,
"spellSiphon": 39
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
"20": "conjureResonance",
"21": "arcaneSpark",
"22": "repulsorShield",
"23": "fallingStar",
"24": "starSeer",
"25": "manaWeaverApprentice",
"26": "mysticRecall",
"27": "starconvergence",
"28": "birdOfGoodLuck",
"29": "restrain-the-beast",
"30": "crowds-favor",
"31": "manaFueledGolem",
"32": "erinasApprentice",
"33": "enigmaticWizard",
"34": "astralBall",
"35": "indomitableVindicator",
"36": "twinFlame",
"37": "astralSage",
"38": "harold-vowed-crusader",
"39": "spellSiphon"
} as const;