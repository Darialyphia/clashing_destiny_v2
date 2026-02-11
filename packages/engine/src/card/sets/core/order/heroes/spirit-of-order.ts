import { OnEnterModifier } from '../../../../../modifier/modifiers/on-enter.modifier';
import type { HeroBlueprint } from '../../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  FACTIONS,
  RARITIES
} from '../../../../card.enums';

export const spiritOfOrder: HeroBlueprint = {
  id: 'spirit-of-order',
  kind: CARD_KINDS.HERO,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  name: 'Spirit of Order',
  description: '@On Enter@: draw 6 cards.',
  faction: FACTIONS.ORDER,
  rarity: RARITIES.COMMON,
  tags: [],
  art: {
    default: {
      foil: {
        sheen: false,
        oil: true,
        gradient: false,
        lightGradient: true,
        scanlines: true
      },
      dimensions: {
        width: 174,
        height: 133
      },
      bg: 'heroes/spirit-of-order-bg',
      main: 'heroes/spirit-of-order',
      breakout: 'heroes/spirit-of-order-breakout',
      frame: 'default',
      tint: FACTIONS.ORDER.defaultCardTint
    }
  },
  destinyCost: 0,
  level: 0,
  lineage: null,
  speed: CARD_SPEED.SLOW,
  atk: 0,
  maxHp: 12,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new OnEnterModifier(game, card, {
        async handler() {
          await card.player.cardManager.draw(6);
        }
      })
    );
  },
  async onPlay() {}
};
