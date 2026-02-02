import type { MinionBlueprint } from '../../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  FACTIONS,
  RARITIES
} from '../../../../card.enums';
import { ToughModifier } from '../../../../../modifier/modifiers/tough.modifier';
import { HinderedModifier } from '../../../../../modifier/modifiers/hindered.modifier';

export const royalGuard: MinionBlueprint = {
  id: 'royal-guard',
  kind: CARD_KINDS.MINION,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'Royal Guard',
  description: '@Hindered 1@, @Tough 1@',
  faction: FACTIONS.ORDER,
  rarity: RARITIES.RARE,
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
      tint: FACTIONS.ORDER.defaultCardTint
    }
  },
  manaCost: 5,
  speed: CARD_SPEED.SLOW,
  atk: 3,
  maxHp: 5,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(new HinderedModifier(game, card, 1));
    await card.modifiers.add(new ToughModifier(game, card, { amount: 1 }));
  },
  async onPlay() {}
};
