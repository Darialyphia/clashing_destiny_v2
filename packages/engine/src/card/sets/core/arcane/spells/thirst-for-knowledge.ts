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
import { EmpowerModifier } from '../../../../../modifier/modifiers/empower.modifier';
import { discardFromHand, getEmpowerStacks } from '../../../../card-actions-utils';

export const thirstForKnowledge: SpellBlueprint = {
  id: 'thirst-for-knowledge',
  kind: CARD_KINDS.SPELL,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'Thirst for Knowledge',
  description: dedent`
  Draw cards equal to your @Empower@ stacks. Then, you may discard an Arcane Spell. If you do, @Empower@.
  `,
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
      bg: 'placeholder-bg',
      main: 'placeholder',
      breakout: 'placeholder-breakout',
      frame: 'default',
      tint: FACTIONS.ARCANE.defaultCardTint
    }
  },
  manaCost: 2,
  speed: CARD_SPEED.FAST,
  abilities: [],
  canPlay: () => true,
  getPreResponseTargets: () => Promise.resolve([]),
  async onInit() {},
  async onPlay(game, card) {
    await card.player.cardManager.draw(getEmpowerStacks(card));

    const [discardedCard] = await discardFromHand(game, card, { min: 0, max: 1 });

    if (discardedCard) {
      new EmpowerModifier(game, card, { amount: 1 });
    }
  }
};
