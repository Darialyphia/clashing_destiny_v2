/** This file is auto-generated. Do not edit manually.
   * This files export the list of all card ids
   * This file should be used in the api package  to reference card ids
   *  Because referencing the full card dictionary seems to cause some circular dependency issues with convex
   */
import type { Rarity, CardKind } from '../card/card.enums';

export const cards = {
"arcaneSight": "arcaneSight",
"arcaneSpark": "arcaneSpark",
"astralBall": "astralBall",
"astralSage": "astralSage",
"birdOfGoodLuck": "birdOfGoodLuck",
"braveCitizen": "braveCitizen",
"conjureFocus": "conjureFocus",
"conjureMight": "conjureMight",
"conjureResonance": "conjureResonance",
"conjureWisdom": "conjureWisdom",
"cremation": "cremation",
"crowds-favor": "crowds-favor",
"day-of-conquest": "day-of-conquest",
"day-of-fortitude": "day-of-fortitude",
"engulfInFlames": "engulfInFlames",
"enigmaticWizard": "enigmaticWizard",
"erinasApprentice": "erinasApprentice",
"erina-violet-witch": "erina-violet-witch",
"fallingStar": "fallingStar",
"fireBall": "fireBall",
"fireBolt": "fireBolt",
"fireImp": "fireImp",
"flameArchmage": "flameArchmage",
"harold-vowed-crusader": "harold-vowed-crusader",
"impassibleMonk": "impassibleMonk",
"indomitableVindicator": "indomitableVindicator",
"innerFire": "innerFire",
"lesserFireSummoning": "lesserFireSummoning",
"manaFueledGolem": "manaFueledGolem",
"manaWeaverApprentice": "manaWeaverApprentice",
"mountainProtector": "mountainProtector",
"mysticRecall": "mysticRecall",
"pyromancer": "pyromancer",
"recklessRecruit": "recklessRecruit",
"repulsorShield": "repulsorShield",
"restrain-the-beast": "restrain-the-beast",
"rockslideGolem": "rockslideGolem",
"runicCatalyst": "runicCatalyst",
"spellSiphon": "spellSiphon",
"starconvergence": "starconvergence",
"starSeer": "starSeer",
"terramancer": "terramancer",
"twinFlame": "twinFlame",
"vineTrapper": "vineTrapper",
"willowisp": "willowisp",
"ashes-of-pain": "ashes-of-pain",
"blast-sorcerer": "blast-sorcerer",
"moltenSalamander": "moltenSalamander",
"austerity": "austerity",
"cosmicFlurry": "cosmicFlurry",
"enjiOneManArmy": "enjiOneManArmy",
"cosmicAvatar": "cosmicAvatar",
"cosmicAvatarAlt": "cosmicAvatarAlt",
"enjiOneManArmyFullArt": "enjiOneManArmyFullArt",
"enjiOneManArmyAlt": "enjiOneManArmyAlt"
} as const;

export const collectableCards = {
"arcaneSight": "arcaneSight",
"arcaneSpark": "arcaneSpark",
"astralSage": "astralSage",
"birdOfGoodLuck": "birdOfGoodLuck",
"braveCitizen": "braveCitizen",
"conjureFocus": "conjureFocus",
"conjureMight": "conjureMight",
"conjureResonance": "conjureResonance",
"conjureWisdom": "conjureWisdom",
"cremation": "cremation",
"crowds-favor": "crowds-favor",
"day-of-conquest": "day-of-conquest",
"day-of-fortitude": "day-of-fortitude",
"engulfInFlames": "engulfInFlames",
"enigmaticWizard": "enigmaticWizard",
"erinasApprentice": "erinasApprentice",
"erina-violet-witch": "erina-violet-witch",
"fallingStar": "fallingStar",
"fireBall": "fireBall",
"fireBolt": "fireBolt",
"fireImp": "fireImp",
"flameArchmage": "flameArchmage",
"harold-vowed-crusader": "harold-vowed-crusader",
"impassibleMonk": "impassibleMonk",
"indomitableVindicator": "indomitableVindicator",
"innerFire": "innerFire",
"lesserFireSummoning": "lesserFireSummoning",
"manaFueledGolem": "manaFueledGolem",
"manaWeaverApprentice": "manaWeaverApprentice",
"mountainProtector": "mountainProtector",
"mysticRecall": "mysticRecall",
"pyromancer": "pyromancer",
"recklessRecruit": "recklessRecruit",
"repulsorShield": "repulsorShield",
"restrain-the-beast": "restrain-the-beast",
"rockslideGolem": "rockslideGolem",
"runicCatalyst": "runicCatalyst",
"spellSiphon": "spellSiphon",
"starconvergence": "starconvergence",
"starSeer": "starSeer",
"terramancer": "terramancer",
"twinFlame": "twinFlame",
"vineTrapper": "vineTrapper",
"ashes-of-pain": "ashes-of-pain",
"blast-sorcerer": "blast-sorcerer",
"moltenSalamander": "moltenSalamander",
"austerity": "austerity",
"cosmicFlurry": "cosmicFlurry",
"enjiOneManArmy": "enjiOneManArmy",
"cosmicAvatar": "cosmicAvatar"
} as const;

type CardSet = Array<{id: string; collectable: boolean; rarity: Rarity, kind: CardKind}>;
export const cardsBySet: Record<string, CardSet> = {
"CORE": [
  {
    "id": "arcaneSight",
    "collectable": true,
    "rarity": "common",
    "kind": "SPELL"
  },
  {
    "id": "arcaneSpark",
    "collectable": true,
    "rarity": "common",
    "kind": "SPELL"
  },
  {
    "id": "astralBall",
    "collectable": false,
    "rarity": "token",
    "kind": "MINION"
  },
  {
    "id": "astralSage",
    "collectable": true,
    "rarity": "epic",
    "kind": "MINION"
  },
  {
    "id": "birdOfGoodLuck",
    "collectable": true,
    "rarity": "epic",
    "kind": "MINION"
  },
  {
    "id": "braveCitizen",
    "collectable": true,
    "rarity": "common",
    "kind": "MINION"
  },
  {
    "id": "conjureFocus",
    "collectable": true,
    "rarity": "rare",
    "kind": "SPELL"
  },
  {
    "id": "conjureMight",
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
    "id": "conjureWisdom",
    "collectable": true,
    "rarity": "rare",
    "kind": "SPELL"
  },
  {
    "id": "cremation",
    "collectable": true,
    "rarity": "common",
    "kind": "SPELL"
  },
  {
    "id": "crowds-favor",
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
    "id": "day-of-fortitude",
    "collectable": true,
    "rarity": "common",
    "kind": "DESTINY"
  },
  {
    "id": "engulfInFlames",
    "collectable": true,
    "rarity": "rare",
    "kind": "SPELL"
  },
  {
    "id": "enigmaticWizard",
    "collectable": true,
    "rarity": "epic",
    "kind": "MINION"
  },
  {
    "id": "erinasApprentice",
    "collectable": true,
    "rarity": "rare",
    "kind": "MINION"
  },
  {
    "id": "erina-violet-witch",
    "collectable": true,
    "rarity": "epic",
    "kind": "HERO"
  },
  {
    "id": "fallingStar",
    "collectable": true,
    "rarity": "rare",
    "kind": "SPELL"
  },
  {
    "id": "fireBall",
    "collectable": true,
    "rarity": "rare",
    "kind": "SPELL"
  },
  {
    "id": "fireBolt",
    "collectable": true,
    "rarity": "common",
    "kind": "SPELL"
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
    "id": "harold-vowed-crusader",
    "collectable": true,
    "rarity": "epic",
    "kind": "HERO"
  },
  {
    "id": "impassibleMonk",
    "collectable": true,
    "rarity": "rare",
    "kind": "MINION"
  },
  {
    "id": "indomitableVindicator",
    "collectable": true,
    "rarity": "rare",
    "kind": "MINION"
  },
  {
    "id": "innerFire",
    "collectable": true,
    "rarity": "common",
    "kind": "SPELL"
  },
  {
    "id": "lesserFireSummoning",
    "collectable": true,
    "rarity": "common",
    "kind": "SPELL"
  },
  {
    "id": "manaFueledGolem",
    "collectable": true,
    "rarity": "rare",
    "kind": "MINION"
  },
  {
    "id": "manaWeaverApprentice",
    "collectable": true,
    "rarity": "common",
    "kind": "MINION"
  },
  {
    "id": "mountainProtector",
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
    "id": "pyromancer",
    "collectable": true,
    "rarity": "common",
    "kind": "MINION"
  },
  {
    "id": "recklessRecruit",
    "collectable": true,
    "rarity": "common",
    "kind": "MINION"
  },
  {
    "id": "repulsorShield",
    "collectable": true,
    "rarity": "common",
    "kind": "SPELL"
  },
  {
    "id": "restrain-the-beast",
    "collectable": true,
    "rarity": "common",
    "kind": "DESTINY"
  },
  {
    "id": "rockslideGolem",
    "collectable": true,
    "rarity": "common",
    "kind": "MINION"
  },
  {
    "id": "runicCatalyst",
    "collectable": true,
    "rarity": "common",
    "kind": "ARTIFACT"
  },
  {
    "id": "spellSiphon",
    "collectable": true,
    "rarity": "rare",
    "kind": "SPELL"
  },
  {
    "id": "starconvergence",
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
    "id": "terramancer",
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
    "id": "vineTrapper",
    "collectable": true,
    "rarity": "rare",
    "kind": "MINION"
  },
  {
    "id": "willowisp",
    "collectable": false,
    "rarity": "common",
    "kind": "MINION"
  },
  {
    "id": "ashes-of-pain",
    "collectable": true,
    "rarity": "rare",
    "kind": "DESTINY"
  },
  {
    "id": "blast-sorcerer",
    "collectable": true,
    "rarity": "common",
    "kind": "MINION"
  },
  {
    "id": "moltenSalamander",
    "collectable": true,
    "rarity": "common",
    "kind": "MINION"
  },
  {
    "id": "austerity",
    "collectable": true,
    "rarity": "epic",
    "kind": "DESTINY"
  },
  {
    "id": "cosmicFlurry",
    "collectable": true,
    "rarity": "rare",
    "kind": "SPELL"
  },
  {
    "id": "enjiOneManArmy",
    "collectable": true,
    "rarity": "legendary",
    "kind": "MINION"
  },
  {
    "id": "cosmicAvatar",
    "collectable": true,
    "rarity": "legendary",
    "kind": "MINION"
  },
  {
    "id": "cosmicAvatarAlt",
    "collectable": false,
    "rarity": "legendary",
    "kind": "MINION"
  },
  {
    "id": "enjiOneManArmyFullArt",
    "collectable": false,
    "rarity": "legendary",
    "kind": "MINION"
  },
  {
    "id": "enjiOneManArmyAlt",
    "collectable": false,
    "rarity": "legendary",
    "kind": "MINION"
  }
]
};

export const cardShortIds: Record<string, number> = {
"arcaneSight": 16,
"arcaneSpark": 21,
"astralBall": 34,
"astralSage": 37,
"birdOfGoodLuck": 28,
"braveCitizen": 4,
"conjureFocus": 19,
"conjureMight": 17,
"conjureResonance": 20,
"conjureWisdom": 18,
"cremation": 7,
"crowds-favor": 30,
"day-of-conquest": 13,
"day-of-fortitude": 12,
"engulfInFlames": 10,
"enigmaticWizard": 33,
"erinasApprentice": 32,
"erina-violet-witch": 1,
"fallingStar": 23,
"fireBall": 9,
"fireBolt": 2,
"fireImp": 14,
"flameArchmage": 15,
"harold-vowed-crusader": 38,
"impassibleMonk": 42,
"indomitableVindicator": 35,
"innerFire": 8,
"lesserFireSummoning": 11,
"manaFueledGolem": 31,
"manaWeaverApprentice": 25,
"mountainProtector": 40,
"mysticRecall": 26,
"pyromancer": 3,
"recklessRecruit": 5,
"repulsorShield": 22,
"restrain-the-beast": 29,
"rockslideGolem": 43,
"runicCatalyst": 45,
"spellSiphon": 39,
"starconvergence": 27,
"starSeer": 24,
"terramancer": 44,
"twinFlame": 36,
"vineTrapper": 41,
"willowisp": 6,
"ashes-of-pain": 46,
"blast-sorcerer": 47,
"moltenSalamander": 48,
"austerity": 49,
"cosmicFlurry": 50,
"enjiOneManArmy": 51,
"cosmicAvatar": 52,
"cosmicAvatarAlt": 53,
"enjiOneManArmyFullArt": 54,
"enjiOneManArmyAlt": 55
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
"39": "spellSiphon",
"40": "mountainProtector",
"41": "vineTrapper",
"42": "impassibleMonk",
"43": "rockslideGolem",
"44": "terramancer",
"45": "runicCatalyst",
"46": "ashes-of-pain",
"47": "blast-sorcerer",
"48": "moltenSalamander",
"49": "austerity",
"50": "cosmicFlurry",
"51": "enjiOneManArmy",
"52": "cosmicAvatar",
"53": "cosmicAvatarAlt",
"54": "enjiOneManArmyFullArt",
"55": "enjiOneManArmyAlt"
} as const;