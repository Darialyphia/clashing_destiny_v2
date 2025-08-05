import dedent from 'dedent';
import { SpellDamage } from '../../../../utils/damage';
import type { SpellBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES,
  SPELL_KINDS
} from '../../../card.enums';
import type { MinionCard } from '../../../entities/minion.entity';

export const tranquility: SpellBlueprint = {
  id: 'tranquility',
  name: 'Tranquility',
  cardIconId: 'spell-tranquility',
  description: dedent`
  Give a minion "If this is not exhausted at the end of the turn, draw a card into your Destiny zone."
  @Echoed Destiny@.
  `,
  collectable: true,
  unique: false,
  manaCost: 1,
  affinity: AFFINITIES.WATER,
  kind: CARD_KINDS.SPELL,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.EPIC,
  subKind: SPELL_KINDS.CAST,
  tags: [],
  canPlay: () => true,
  getPreResponseTargets: async () => [],
  async onInit() {},
  async onPlay(game, card) {}
};
