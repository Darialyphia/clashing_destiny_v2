import { OnEnterModifier } from '../../../../../modifier/modifiers/on-enter.modifier';
import { scry } from '../../../../card-actions-utils';
import type { MinionBlueprint } from '../../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  FACTIONS,
  RARITIES
} from '../../../../card.enums';

export const astralExplorer: MinionBlueprint = {
  id: 'astral-explorer',
  kind: CARD_KINDS.MINION,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'Astral Explorer',
  description: '@On Enter@: @Scry 2@.',
  faction: FACTIONS.ARCANE,
  rarity: RARITIES.COMMON,
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
      bg: 'minions/astral-explorer-bg',
      main: 'minions/astral-explorer',
      frame: 'default',
      tint: FACTIONS.ARCANE.defaultCardTint
    }
  },
  manaCost: 2,
  speed: CARD_SPEED.SLOW,
  atk: 1,
  maxHp: 2,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new OnEnterModifier(game, card, {
        handler: async () => {
          await scry(game, card, 2);
        }
      })
    );
  },
  async onPlay() {}
};
