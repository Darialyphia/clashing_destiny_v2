import dedent from 'dedent';
import { SpellDamage } from '../../../../utils/damage';
import type { SpellBlueprint } from '../../../card-blueprint';
import {
  isMinion,
  isSpell,
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
import { EfficiencyModifier } from '../../../../modifier/modifiers/efficiency.modifier';
import { FleetingModifier } from '../../../../modifier/modifiers/fleeting.modifier';

export const thirstForKnowledge: SpellBlueprint = {
  id: 'thirst-for-knowledge',
  name: 'Thirst For Knowledge',
  cardIconId: 'spells/thirst-for-knowledge',
  description: dedent`
  Search your deck for a Spell card and add it to your hand. It has @Fleeting@.
  @Efficiency@.
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
  abilities: [],
  tags: [],
  canPlay: () => true,
  getPreResponseTargets: () => Promise.resolve([]),
  async onInit(game, card) {
    await card.modifiers.add(new EfficiencyModifier(game, card));
  },
  async onPlay(game, card) {
    const [searchedCard] = await game.interaction.chooseCards({
      player: card.player,
      label: 'Choose a Spell card to add to your hand',
      minChoiceCount: 1,
      maxChoiceCount: 1,
      choices: card.player.cardManager.mainDeck.cards.filter(c => isSpell(c))
    });

    await searchedCard.addToHand();
    await searchedCard.modifiers.add(new FleetingModifier(game, card));
  }
};
