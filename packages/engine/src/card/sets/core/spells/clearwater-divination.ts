import dedent from 'dedent';
import type { SpellBlueprint } from '../../../card-blueprint';
import { isMinion } from '../../../card-utils';
import {
  SPELL_SCHOOLS,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';
import { scry } from '../../../card-actions-utils';
import { LingeringDestinyModifier } from '../../../../modifier/modifiers/lingering-destiny.modifier';

export const clearwaterDivination: SpellBlueprint = {
  id: 'clearwater-divination',
  name: 'Clearwater Divination',
  cardIconId: 'spells/clearwater-divination',
  description: dedent`
  @Scry 3.
  @Lingering Destiny@
  `,
  collectable: true,
  unique: false,
  manaCost: 1,
  speed: CARD_SPEED.SLOW,
  spellSchool: SPELL_SCHOOLS.WATER,
  job: null,
  kind: CARD_KINDS.SPELL,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.RARE,
  abilities: [],
  tags: [],
  canPlay: () => true,
  getPreResponseTargets: () => Promise.resolve([]),
  async onInit(game, card) {
    await card.modifiers.add(new LingeringDestinyModifier(game, card));
  },
  async onPlay(game, card) {
    await scry(game, card, 3);
  }
};
