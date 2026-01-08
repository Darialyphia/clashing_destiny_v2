import dedent from 'dedent';
import { SpellDamage } from '../../../../../utils/damage';
import type { SpellBlueprint } from '../../../../card-blueprint';
import {
  CARD_SPEED,
  CARD_KINDS,
  CARD_DECK_SOURCES,
  CARD_SETS,
  RARITIES,
  FACTIONS
} from '../../../../card.enums';

export const wingOfSimurgh: SpellBlueprint = {
  id: 'wing-of-simurgh',
  kind: CARD_KINDS.SPELL,
  collectable: false,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'Wing of Simurgh',
  description: dedent`
    Deal 1 damage to all enemy minions.
  `,
  faction: FACTIONS.ARCANE,
  rarity: RARITIES.TOKEN,
  tags: [],
  art: {
    default: {
      foil: {
        sheen: true,
        oil: false,
        gradient: false,
        lightGradient: false,
        scanlines: false
      },
      dimensions: {
        width: 174,
        height: 133
      },
      bg: 'placeholder-bg',
      main: 'placeholder',
      frame: 'default',
      tint: FACTIONS.ARCANE.defaultCardTint
    }
  },
  manaCost: 1,
  speed: CARD_SPEED.FAST,
  abilities: [],
  canPlay: () => true,
  getPreResponseTargets: () => Promise.resolve([]),
  async onInit() {},
  async onPlay(game, card) {
    const enemyMinions = card.player.opponent.boardSide.getAllMinions();

    for (const minion of enemyMinions) {
      await minion.takeDamage(card, new SpellDamage(1, card));
    }
  }
};
