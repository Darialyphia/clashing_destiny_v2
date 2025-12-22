import dedent from 'dedent';
import { AuraModifierMixin } from '../../../../../modifier/mixins/aura.mixin';
import { Modifier } from '../../../../../modifier/modifier.entity';
import { SimpleSpellpowerBuffModifier } from '../../../../../modifier/modifiers/simple-spellpower.buff.modifier';
import type { MinionBlueprint } from '../../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  FACTIONS,
  RARITIES,
  CARD_LOCATIONS
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
  @Consume@ @[knowledge]@.

  @On Enter@: @Empower 1@.
  @On Hit@: @Empower 2@..
  `,
  faction: FACTIONS.ARCANE,
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
      tint: FACTIONS.ARCANE.defaultCardTint
    }
  },
  manaCost: 4,
  runeCost: {
    KNOWLEDGE: 2,
    RESONANCE: 1
  },
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
            new EmpowerModifier(game, card, { amount: 2 })
          );
        }
      })
    );
  },
  async onPlay(game, card) {
    if (card.isPlayedFromHand) {
      await card.player.spendRune({ KNOWLEDGE: 1 });
    }
  }
};
