import { keyBy } from 'lodash-es';
import type { CardBlueprint } from '../card-blueprint';
import { CARD_SETS, type CardSetId } from '../card.enums';
import type { IndexedRecord } from '@game/shared';
import { coreSet } from './core.set';
import { tutorialSet } from './tutorial.set';

export type CardSet = { id: string; name: string; cards: CardBlueprint[] };

export const CARD_SET_DICTIONARY = {
  [CARD_SETS.CORE]: coreSet,
  [CARD_SETS.TUTORIAL]: tutorialSet
} as const satisfies Record<
  CardSetId,
  { id: string; name: string; cards: CardBlueprint[] }
>;

export const CARDS_DICTIONARY = {
  ...keyBy(coreSet.cards, 'id'),
  ...keyBy(tutorialSet.cards, 'id')
} as const satisfies IndexedRecord<CardBlueprint, 'id'>;
