import { type MainDeckCard } from '../../../../board/board.system';
import { OnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import { discover } from '../../../card-actions-utils';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';

export const enjiOneManArmy: MinionBlueprint = {
  id: 'enji-one-man-army',
  name: 'Enji, One-Man Army',
  cardIconId: 'unit-enji-one-man-army',
  description: `@Unique@, @Cleave@, @Piercing@.\nIf you have another minion on the board, destroy this.`,
  collectable: true,
  unique: false,
  manaCost: 4,
  atk: 4,
  maxHp: 5,
  rarity: RARITIES.LEGENDARY,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  affinity: AFFINITIES.FIRE,
  setId: CARD_SETS.CORE,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {},
  async onPlay() {}
};
