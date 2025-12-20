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

export const magicChanneler: MinionBlueprint = {
  id: 'magic-channeler',
  kind: CARD_KINDS.MINION,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'Magic Channeler',
  description: '@Spellpower 1@.',
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
      bg: 'placeholder-bg',
      main: 'placeholder',
      breakout: 'placeholder-breakout',
      frame: 'default',
      tint: FACTIONS.ARCANE.defaultCardTint
    }
  },
  manaCost: 2,
  runeCost: {
    MIGHT: 1
  },
  speed: CARD_SPEED.SLOW,
  atk: 1,
  maxHp: 2,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    const MODIFIER_ID = 'magic-channeler-spellpower';
    await card.modifiers.add(
      new Modifier('magic-channeler-aura', game, card, {
        mixins: [
          new AuraModifierMixin(game, {
            isElligible(candidate) {
              return (
                card.location === CARD_LOCATIONS.BOARD &&
                candidate.equals(card.player.hero)
              );
            },
            async onGainAura(candidate) {
              await candidate.modifiers.add(
                new SimpleSpellpowerBuffModifier(MODIFIER_ID, game, card, { amount: 1 })
              );
            },
            async onLoseAura(candidate) {
              await candidate.modifiers.remove(MODIFIER_ID);
            }
          })
        ]
      })
    );
  },
  async onPlay() {}
};
