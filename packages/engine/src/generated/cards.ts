/** This file is auto-generated. Do not edit manually.
 * This files export the list of all card ids
 * This file should be used in the api package  to reference card ids
 *  Because referencing the full card dictionary seems to cause some circular dependency issues with convex
 */
import type { Rarity } from '../card/card.enums';
export const cards = {
  sample: 'sample',
  erina: 'erina'
} as const;

export const collectableCards = {
  sample: 'sample',
  erina: 'erina'
} as const;

type CardSet = Array<{ id: string; collectable: boolean; rarity: Rarity }>;
export const cardsBySet: Record<string, CardSet> = {
  CORE: [
    {
      id: 'sample',
      collectable: true,
      rarity: 'common'
    },
    {
      id: 'erina',
      collectable: true,
      rarity: 'common'
    }
  ]
};

export const cardShortIds: Record<string, number> = {
  sample: 1,
  erina: 2
} as const;

export const cardIdByShortId: Record<number, string> = {
  '1': 'sample',
  '2': 'erina'
} as const;
