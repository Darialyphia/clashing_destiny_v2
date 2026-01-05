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

export const callToHeaven: SpellBlueprint = {
  id: 'call-to-heaven',
  kind: CARD_KINDS.SPELL,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'Call to Heaven',
  description: dedent`
    Return all minions with who cost @[mana] 2@ or less to their owner's hand. Draw a card.
  `,
  faction: FACTIONS.ORDER,
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
      tint: FACTIONS.ORDER.defaultCardTint
    }
  },
  manaCost: 4,
  speed: CARD_SPEED.FAST,
  abilities: [],
  canPlay() {
    return true;
  },
  getPreResponseTargets() {
    return Promise.resolve([]);
  },
  async onInit() {},
  async onPlay(game, card) {
    const allMinions = [
      ...card.player.boardSide.getAllMinions(),
      ...card.player.opponent.boardSide.getAllMinions()
    ];

    const targetMinions = allMinions.filter(minion => minion.manaCost <= 2);

    for (const minion of targetMinions) {
      await minion.addToHand();
    }

    await card.player.cardManager.draw(1);
  }
};
