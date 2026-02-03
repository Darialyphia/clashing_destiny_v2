import dedent from 'dedent';
import type { SpellBlueprint } from '../../../../card-blueprint';
import {
  CARD_SPEED,
  CARD_KINDS,
  CARD_DECK_SOURCES,
  CARD_SETS,
  RARITIES,
  FACTIONS
} from '../../../../card.enums';
import { getEmpowerStacks } from '../../../../card-actions-utils';
import { SimpleManacostModifier } from '../../../../../modifier/modifiers/simple-manacost-modifier';

export const thirstForKnowledge: SpellBlueprint = {
  id: 'thirst-for-knowledge',
  kind: CARD_KINDS.SPELL,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'Thirst for Knowledge',
  description: dedent`
  This costs @[mana] 1@ less for each @Empower@ on your @hero@.
  Draw 2 cards.
  `,
  dynamicDescription(game, card) {
    const empowerStacks = getEmpowerStacks(card);
    return dedent`
  This costs @[dynamic]${empowerStacks}|1 * empowered stacks@ less.
  Draw 2 cards.
  `;
  },
  faction: FACTIONS.ARCANE,
  rarity: RARITIES.RARE,
  tags: [],
  art: {
    default: {
      foil: {
        sheen: true,
        oil: true,
        gradient: true,
        lightGradient: false,
        scanlines: false
      },
      dimensions: {
        width: 174,
        height: 133
      },
      bg: 'spells/thirst-for-knowledge-bg',
      main: 'spells/thirst-for-knowledge',
      frame: 'default',
      tint: FACTIONS.ARCANE.defaultCardTint
    }
  },
  manaCost: 4,
  speed: CARD_SPEED.FAST,
  abilities: [],
  canPlay: () => true,
  getPreResponseTargets: () => Promise.resolve([]),
  async onInit() {},
  async onPlay(game, card) {
    await card.modifiers.add(
      new SimpleManacostModifier('thirst-for-knowledge-cost-discount', game, card, {
        amount() {
          return -getEmpowerStacks(card);
        }
      })
    );
    await card.player.cardManager.draw(2);
  }
};
