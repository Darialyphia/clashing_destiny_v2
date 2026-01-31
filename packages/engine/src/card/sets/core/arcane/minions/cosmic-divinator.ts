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
import { OnEnterModifier } from '../../../../../modifier/modifiers/on-enter.modifier';
import { EmpowerModifier } from '../../../../../modifier/modifiers/empower.modifier';
import { OnAttackModifier } from '../../../../../modifier/modifiers/on-attack.modifier';

export const cosmicDivinator: MinionBlueprint = {
  id: 'cosmic-divinator',
  kind: CARD_KINDS.MINION,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'Cosmic Divinator',
  description: dedent`
  @On Enter@: @Empower 1@.
  @On Hit@: @Empower 1@.
  `,
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
      bg: 'minions/cosmic-divinator-bg',
      main: 'minions/cosmic-divinator',
      frame: 'default',
      tint: FACTIONS.ARCANE.defaultCardTint
    }
  },
  manaCost: 4,
  speed: CARD_SPEED.SLOW,
  atk: 2,
  maxHp: 4,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new OnEnterModifier(game, card, {
        handler: async () => {
          await card.player.hero.modifiers.add(
            new EmpowerModifier(game, card, { amount: 1 })
          );
        }
      })
    );

    await card.modifiers.add(
      new OnAttackModifier(game, card, {
        handler: async () => {
          await card.player.hero.modifiers.add(
            new EmpowerModifier(game, card, { amount: 1 })
          );
        }
      })
    );
  },
  async onPlay() {}
};
