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

export const spiritOfArcane: HeroBlueprint = {
  id: 'spirit-of-arcane',
  kind: CARD_KINDS.HERO,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  name: 'Spirit of Arcane',
  description: '@On Enter@: draw 7 cards.',
  faction: FACTIONS.ARCANE,
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
      bg: 'heroes/spirit-of-arcane-bg',
      main: 'heroes/spirit-of-arcane',
      breakout: 'heroes/spirit-of-arcane-breakout',
      frame: 'default',
      tint: FACTIONS.ARCANE.defaultCardTint
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
