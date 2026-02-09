import dedent from 'dedent';
import type { MinionBlueprint } from '../../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  FACTIONS,
  RARITIES
} from '../../../../card.enums';
import { PrideModifier } from '../../../../../modifier/modifiers/pride.modifier';
import { HonorModifier } from '../../../../../modifier/modifiers/honor.modifier';
import { LingeringDestinyModifier } from '../../../../../modifier/modifiers/lingering-destiny.modifier';

export const angelDevotee: MinionBlueprint = {
  id: 'angel-devotee',
  kind: CARD_KINDS.MINION,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'Angel Devotee',
  description: dedent`
   @Pride 2@, @@Honor@.

   @Lingering Destiny@.
  `,
  faction: FACTIONS.ORDER,
  rarity: RARITIES.COMMON,
  tags: [],
  art: {
    default: {
      foil: {
        sheen: true
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
  manaCost: 1,
  speed: CARD_SPEED.SLOW,
  atk: 2,
  maxHp: 2,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(new HonorModifier(game, card));
    await card.modifiers.add(new PrideModifier(game, card, 2));
    await card.modifiers.add(new LingeringDestinyModifier(game, card));
  },
  async onPlay() {}
};
