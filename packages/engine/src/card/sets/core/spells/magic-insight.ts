import dedent from 'dedent';
import type { SpellBlueprint } from '../../../card-blueprint';
import {
  SPELL_SCHOOLS,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';
import { LingeringDestinyModifier } from '../../../../modifier/modifiers/lingering-destiny.modifier';
import { empower } from '../../../card-actions-utils';

export const magicInsight: SpellBlueprint = {
  id: 'magic-insight',
  name: 'Magic Insight',
  cardIconId: 'spells/magic-insight',
  description: dedent`
  @Empower 1@.
  @Lingering Destiny@
  `,
  collectable: true,
  unique: false,
  manaCost: 1,
  speed: CARD_SPEED.FAST,
  spellSchool: SPELL_SCHOOLS.ARCANE,
  job: null,
  kind: CARD_KINDS.SPELL,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  abilities: [],
  tags: [],
  canPlay: () => true,
  getPreResponseTargets: () => Promise.resolve([]),
  async onInit(game, card) {
    await card.modifiers.add(new LingeringDestinyModifier(game, card));
  },
  async onPlay(game, card) {
    empower(game, card, 1);
  }
};
