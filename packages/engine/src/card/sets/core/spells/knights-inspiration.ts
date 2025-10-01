import { SimpleAttackBuffModifier } from '../../../../modifier/modifiers/simple-attack-buff.modifier';
import { SimpleHealthBuffModifier } from '../../../../modifier/modifiers/simple-health-buff.modifier';
import type { SpellBlueprint } from '../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES,
  SPELL_SCHOOLS
} from '../../../card.enums';

export const knightsInspiration: SpellBlueprint = {
  id: 'knights-inspiration',
  name: "Knight's Inspiration",
  cardIconId: 'spells/knights-inspiration',
  description: 'Give friendly minions +1 @[attack]@ and +2 @[health]@.',
  collectable: true,
  unique: false,
  manaCost: 3,
  speed: CARD_SPEED.SLOW,
  spellSchool: SPELL_SCHOOLS.LIGHT,
  job: null,
  kind: CARD_KINDS.SPELL,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  tags: [],
  canPlay: () => true,
  getPreResponseTargets: () => Promise.resolve([]),
  async onInit() {},
  async onPlay(game, card) {
    for (const minion of card.player.minions) {
      await minion.modifiers.add(
        new SimpleAttackBuffModifier('knights-inspiration-atk', game, card, {
          name: "Knight's Inspiration",
          amount: 2
        })
      );
      await minion.modifiers.add(
        new SimpleHealthBuffModifier('knights-inspiration-hp', game, card, {
          name: "Knight's Inspiration",
          amount: 2
        })
      );
    }
  }
};
