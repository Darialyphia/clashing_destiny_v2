import { SimpleSpellpowerBuffModifier } from '../../../../modifier/modifiers/simple-spellpower.buff.modifier';
import { WhileOnBoardModifier } from '../../../../modifier/modifiers/while-on-board.modifier';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';

export const pyreArchfiend: MinionBlueprint = {
  id: 'pyre-archfiend',
  name: 'Pyre Archfiend',
  cardIconId: 'unit-pyre-archfiend',
  description: `@Cleave@.\n@On Enter@: You may discard a card. If you do, deal damage to the minion in front of this equal to its cost.`,
  collectable: true,
  unique: false,
  manaCost: 4,
  atk: 3,
  maxHp: 3,
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
