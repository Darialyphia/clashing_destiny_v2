/** This file is auto-generated. Do not edit manually.
 * This files export the list of all card ids
 * This file should be used in the api package  to reference card ids
 *  Because referencing the full card dictionary seems to cause some circular dependency issues with convex
 */
import type { Rarity } from '../card/card.enums';
export const cards = {
  erina: 'erina',
  sample: 'sample',
  careful_study: 'careful_study',
  sample2: 'sample2'
} as const;

export const collectableCards = {
  erina: 'erina',
  sample: 'sample',
  careful_study: 'careful_study',
  sample2: 'sample2'
} as const;

type CardSet = Array<{ id: string; collectable: boolean; rarity: Rarity }>;
export const cardsBySet: Record<string, CardSet> = {
  CORE: [
    {
      id: 'erina',
      collectable: true,
      rarity: 'common'
    },
    {
      id: 'sample',
      collectable: true,
      rarity: 'common'
    },
    {
      id: 'careful_study',
      collectable: true,
      rarity: 'common'
    },
    {
      id: 'sample2',
      collectable: true,
      rarity: 'common'
    }
  ]
};

export const cardShortIds: Record<string, number> = {
  erina: 2,
  sample: 1,
  careful_study: 3,
  sample2: 4
} as const;

export const cardIdByShortId: Record<number, string> = {
  '1': 'sample',
  '2': 'erina',
  '3': 'careful_study',
  '4': 'sample2'
} as const;
