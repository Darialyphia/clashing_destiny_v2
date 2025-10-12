import dedent from 'dedent';
import { SpellDamage } from '../../../../utils/damage';
import type { SpellBlueprint } from '../../../card-blueprint';
import {
  isMinion,
  multipleEnemyTargetRules,
  singleEnemyTargetRules
} from '../../../card-utils';
import {
  SPELL_SCHOOLS,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';
import type { MinionCard } from '../../../entities/minion.entity';
import { EfficiencyModifier } from '../../../../modifier/modifiers/efficiency.modifier';

export const thirstForKnowledge: SpellBlueprint = {
  id: 'thirst-for-knowledge',
  name: 'Thirst For Knowledge',
  cardIconId: 'spells/thirst-for-knowledge',
  description: dedent`
  Draw 2 cards. @Efficiency@
  `,
  collectable: true,
  unique: false,
  manaCost: 5,
  speed: CARD_SPEED.FAST,
  spellSchool: SPELL_SCHOOLS.ARCANE,
  job: null,
  kind: CARD_KINDS.SPELL,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  tags: [],
  canPlay: () => true,
  getPreResponseTargets: () => Promise.resolve([]),
  async onInit(game, card) {
    await card.modifiers.add(new EfficiencyModifier(game, card));
  },
  async onPlay(game, card) {
    await card.player.cardManager.draw(2);
  }
};
