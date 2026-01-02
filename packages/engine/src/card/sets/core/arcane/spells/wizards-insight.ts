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
import { scry } from '../../../../card-actions-utils';
import { EmpowerModifier } from '../../../../../modifier/modifiers/empower.modifier';

export const wizardsInsight: SpellBlueprint = {
  id: 'wizards-insight',
  kind: CARD_KINDS.SPELL,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: "Wizard's Insight",
  description: dedent`
  @Scry 1@, @Empower 1@. If you were already @Empowered@, draw a card into your Destiny zone.
  `,
  faction: FACTIONS.ARCANE,
  rarity: RARITIES.COMMON,
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
    const isEmpowered = card.player.hero.modifiers.has(EmpowerModifier);
    await scry(game, card, 1);
    await card.player.hero.modifiers.add(new EmpowerModifier(game, card, { amount: 1 }));
    if (isEmpowered) {
      await card.player.cardManager.drawIntoDestinyZone(1);
    }
  }
};
