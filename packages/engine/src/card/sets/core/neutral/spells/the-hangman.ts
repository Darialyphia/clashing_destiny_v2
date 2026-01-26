import dedent from 'dedent';
import type { SpellBlueprint } from '../../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  FACTIONS,
  RARITIES
} from '../../../../card.enums';
import { hasBalance } from '../../../../card-actions-utils';

export const theHangman: SpellBlueprint = {
  id: 'the-hangman',
  kind: CARD_KINDS.SPELL,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  name: 'The Hangman',
  description: dedent`
    If you have @Balanceà, exhaust all minions that are awake and wake up all minions that are exhausted.
  `,
  faction: FACTIONS.NEUTRAL,
  rarity: RARITIES.EPIC,
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
      breakout: 'placeholder-breakout',
      frame: 'default',
      tint: FACTIONS.NEUTRAL.defaultCardTint
    }
  },
  destinyCost: 3,
  speed: CARD_SPEED.SLOW,
  abilities: [],
  canPlay: () => true,
  getPreResponseTargets: () => Promise.resolve([]),
  async onInit() {},
  async onPlay(game, card) {
    if (!hasBalance(card)) return;

    const minions = [...card.player.minions, ...card.player.enemyMinions];
    const minionsToExhaust = minions.filter(minion => !minion.isExhausted);
    const minionsToWakeUp = minions.filter(minion => minion.isExhausted);

    for (const minion of minionsToExhaust) {
      await minion.exhaust();
    }

    for (const minion of minionsToWakeUp) {
      await minion.wakeUp();
    }
  }
};
