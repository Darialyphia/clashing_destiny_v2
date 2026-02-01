import { EmpowerModifier } from '../../../../../modifier/modifiers/empower.modifier';
import { OnEnterModifier } from '../../../../../modifier/modifiers/on-enter.modifier';
import type { MinionBlueprint } from '../../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  FACTIONS,
  RARITIES
} from '../../../../card.enums';

export const starseeker: MinionBlueprint = {
  id: 'starseeker',
  kind: CARD_KINDS.MINION,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  name: 'Starseeker',
  description: '@On Enter@: @Empower 1@.',
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
      bg: 'minions/starseeker-bg',
      main: 'minions/starseeker',
      frame: 'default',
      tint: FACTIONS.ARCANE.defaultCardTint
    }
  },
  destinyCost: 1,
  speed: CARD_SPEED.SLOW,
  atk: 2,
  maxHp: 1,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new OnEnterModifier(game, card, {
        async handler() {
          await card.player.hero.modifiers.add(
            new EmpowerModifier(game, card, { amount: 1 })
          );
        }
      })
    );
  },
  async onPlay() {}
};
