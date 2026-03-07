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
import { IntimidateModifier } from '../../../../../modifier/modifiers/intimidate.modifier';
import { OnEnterModifier } from '../../../../../modifier/modifiers/on-enter.modifier';

export const hadranielGodsMajesty: MinionBlueprint = {
  id: 'hadraniel-gods-majesty',
  kind: CARD_KINDS.MINION,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  name: "Hadraniel, God's Majesty",
  description: dedent`
   TODO rework.
  `,
  faction: FACTIONS.ORDER,
  rarity: RARITIES.LEGENDARY,
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
  destinyCost: 4,
  speed: CARD_SPEED.FAST,
  atk: 2,
  maxHp: 6,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(new PrideModifier(game, card, 2));
    await card.modifiers.add(new IntimidateModifier(game, card, { level: 2 }));

    await card.modifiers.add(
      new OnEnterModifier(game, card, {
        async handler() {}
      })
    );
  },
  async onPlay() {}
};
