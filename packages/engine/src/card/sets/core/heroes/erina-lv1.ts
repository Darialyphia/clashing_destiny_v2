import dedent from 'dedent';
import type { HeroBlueprint } from '../../../card-blueprint';
import {
  SPELL_SCHOOLS,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  HERO_JOBS,
  RARITIES
} from '../../../card.enums';
import { OnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import { scry } from '../../../card-actions-utils';

export const erinaLv1: HeroBlueprint = {
  id: 'erina-lv1',
  name: 'Erina, Council Mage',
  description: dedent`@On Enter@: @Scry 2@.`,
  cardIconId: 'heroes/erina-lv1',
  kind: CARD_KINDS.HERO,
  level: 1,
  destinyCost: 1,
  speed: CARD_SPEED.SLOW,
  jobs: [HERO_JOBS.MAGE],
  spellSchools: [],
  setId: CARD_SETS.CORE,
  rarity: RARITIES.EPIC,
  collectable: true,
  unique: false,
  lineage: 'erina',
  spellPower: 0,
  atk: 0,
  maxHp: 16,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new OnEnterModifier(game, card, {
        handler: async () => {
          await scry(game, card, 2);
        }
      })
    );
  },
  async onPlay() {}
};
