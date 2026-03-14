/** This file is auto-generated. Do not edit manually.
 * This files export the list of all card ids
 * This file should be used in the api package  to reference card ids
 *  Because referencing the full card dictionary seems to cause some circular dependency issues with convex
 */
import type { Rarity, CardDeckSource } from '../card/card.enums';
export const cards = {} as const;

export const collectableCards = {} as const;

type CardSet = Array<{
  id: string;
  collectable: boolean;
  rarity: Rarity;
  deckSource: CardDeckSource;
}>;
export const cardsBySet: Record<string, CardSet> = {
  CORE: []
};

export const cardShortIds: Record<string, number> = {} as const;

export const cardIdByShortId: Record<number, string> = {} as const;
