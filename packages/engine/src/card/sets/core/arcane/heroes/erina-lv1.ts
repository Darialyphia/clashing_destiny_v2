import type { HeroBlueprint } from '../../../../card-blueprint';
import { isSpell } from '../../../../card-utils';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  FACTIONS,
  RARITIES,
  CARD_LOCATIONS
} from '../../../../card.enums';

export const erinaLv1: HeroBlueprint = {
  id: 'erina-council-mage',
  kind: CARD_KINDS.HERO,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  name: 'Erina, Council Mage',
  description: '',
  faction: FACTIONS.ARCANE,
  rarity: RARITIES.RARE,
  tags: [],
  art: {
    default: {
      foil: {
        sheen: false,
        oil: false,
        gradient: false,
        lightGradient: true,
        scanlines: false,
        goldenGlare: false,
        glitter: true
      },
      dimensions: {
        width: 174,
        height: 140
      },
      bg: 'heroes/erina-lv1-bg',
      main: 'heroes/erina-lv1',
      breakout: 'heroes/erina-lv1-breakout',
      frame: 'default',
      tint: FACTIONS.ARCANE.defaultCardTint
    }
  },
  destinyCost: 1,
  runeCost: {},
  level: 1,
  lineage: 'erina',
  speed: CARD_SPEED.SLOW,
  atk: 0,
  maxHp: 15,
  canPlay: () => true,
  abilities: [
    {
      id: 'erina-lv1-ability-1',
      canUse: (game, card) => card.location === CARD_LOCATIONS.BOARD,
      shouldExhaust: true,
      manaCost: 1,
      runeCost: {},
      description: 'Draw a spell, then discard 1 card.',
      getPreResponseTargets: () => Promise.resolve([]),
      label: 'Draw a spell and discard',
      speed: CARD_SPEED.FAST,
      async onResolve(game, card) {
        await card.player.cardManager.drawWithFilter(1, isSpell);
        const [cardToDiscard] = await game.interaction.chooseCards({
          player: card.player,
          label: 'Choose a card to discard',
          minChoiceCount: 1,
          maxChoiceCount: 1,
          choices: card.player.cardManager.hand
        });
        await cardToDiscard.discard();
      }
    }
  ],
  async onInit() {},
  async onPlay() {}
};
