/** This file is auto-generated. Do not edit manually.
   * This files export the list of all card ids
   * This file should be used in the api package  to reference card ids
   *  Because referencing the full card dictionary seems to cause some circular dependency issues with convex
   */
import type { Rarity, CardDeckSource } from '../card/card.enums';
export const cards = {
"sample": "sample",
"rune_of_focus": "rune_of_focus",
"rune_of_might": "rune_of_might",
"rune_of_resonance": "rune_of_resonance",
"rune_of_wisdom": "rune_of_wisdom"
} as const;

export const collectableCards = {
"sample": "sample",
"rune_of_focus": "rune_of_focus",
"rune_of_might": "rune_of_might",
"rune_of_resonance": "rune_of_resonance",
"rune_of_wisdom": "rune_of_wisdom"
} as const;

type CardSet = Array<{id: string; collectable: boolean; rarity: Rarity; deckSource: CardDeckSource }>;
export const cardsBySet: Record<string, CardSet> = {
"CORE": [
  {
    "id": "sample",
    "collectable": true,
    "rarity": "common",
    "deckSource": "mainDeck"
  },
  {
    "id": "rune_of_focus",
    "collectable": true,
    "rarity": "common",
    "deckSource": "runeDeck"
  },
  {
    "id": "rune_of_might",
    "collectable": true,
    "rarity": "common",
    "deckSource": "runeDeck"
  },
  {
    "id": "rune_of_resonance",
    "collectable": true,
    "rarity": "common",
    "deckSource": "runeDeck"
  },
  {
    "id": "rune_of_wisdom",
    "collectable": true,
    "rarity": "common",
    "deckSource": "runeDeck"
  },
  {
    "id": "sample",
    "collectable": true,
    "rarity": "common",
    "deckSource": "mainDeck"
  },
  {
    "id": "rune_of_focus",
    "collectable": true,
    "rarity": "common",
    "deckSource": "runeDeck"
  },
  {
    "id": "rune_of_might",
    "collectable": true,
    "rarity": "common",
    "deckSource": "runeDeck"
  },
  {
    "id": "rune_of_resonance",
    "collectable": true,
    "rarity": "common",
    "deckSource": "runeDeck"
  },
  {
    "id": "rune_of_wisdom",
    "collectable": true,
    "rarity": "common",
    "deckSource": "runeDeck"
  }
]
};

export const cardShortIds: Record<string, number> = {
"sample": 1,
"rune_of_focus": 5,
"rune_of_might": 2,
"rune_of_resonance": 6,
"rune_of_wisdom": 3
} as const;

export const cardIdByShortId: Record<number, string> = {
"1": "sample",
"2": "rune_of_might",
"3": "rune_of_wisdom",
"5": "rune_of_focus",
"6": "rune_of_resonance"
} as const;