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
import { LoyaltyModifier } from '../../../../../modifier/modifiers/loyalty.modifier';
import { EmpowerModifier } from '../../../../../modifier/modifiers/empower.modifier';
import { discardFromHand } from '../../../../card-actions-utils';
import { isSpell } from '../../../../card-utils';

export const thirstForKnowledge: SpellBlueprint = {
  id: 'thirst-for-knowledge',
  kind: CARD_KINDS.SPELL,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'Thirst for Knowledge',
  description: dedent`
  @Loyalty 2@.
  Draw 2 cards, then discard a card. If it's an Arcane Spell, @Empower 1@.
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
  manaCost: 3,
  speed: CARD_SPEED.FAST,
  abilities: [],
  canPlay: () => true,
  getPreResponseTargets: () => Promise.resolve([]),
  async onInit(game, card) {
    await card.modifiers.add(new LoyaltyModifier(game, card, { amount: 2 }));
  },
  async onPlay(game, card) {
    await card.player.cardManager.draw(2);

    const [discardedCard] = await discardFromHand(game, card, { min: 1, max: 1 });

    const shouldEmpower =
      discardedCard &&
      isSpell(discardedCard) &&
      discardedCard.faction === FACTIONS.ARCANE;

    if (!shouldEmpower) return;

    await card.player.hero.modifiers.add(new EmpowerModifier(game, card, { amount: 1 }));
  }
};
