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

export const frostNova: SpellBlueprint = {
  id: 'frost-nova',
  kind: CARD_KINDS.SPELL,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  name: 'Frost Nova',
  description: dedent`Exhaust all minions.`,
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
  destinyCost: 2,
  speed: CARD_SPEED.FAST,
  abilities: [],
  canPlay: (game, card) => card.player.hero.modifiers.has(EmpowerModifier),
  getPreResponseTargets: () => Promise.resolve([]),
  async onInit() {},
  async onPlay(game, card) {
    const minionsToExhaust = [...card.player.minions, ...card.player.opponent.minions];

    for (const minion of minionsToExhaust) {
      await minion.exhaust();
    }
  }
};
