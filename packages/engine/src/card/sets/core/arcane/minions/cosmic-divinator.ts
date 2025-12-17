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
  RARITIES
} from '../../../../card.enums';
import { LoyaltyModifier } from '../../../../../modifier/modifiers/loyalty.modifier';

export const cosmicDivinator: MinionBlueprint = {
  id: 'cosmic-divinator',
  kind: CARD_KINDS.MINION,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'Cosmic Divinator',
  description: dedent`
  @Loyalty 1@, @Consume@ @[knowledge]@.

  @Spellpower 1@.
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
    KNOWLEDGE: 1,
    MIGHT: 2
  },
  speed: CARD_SPEED.SLOW,
  atk: 2,
  maxHp: 4,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(new LoyaltyModifier(game, card, { amount: 1 }));

    const MODIFIER_ID = 'cosmic-divinator-spellpower';
    await card.modifiers.add(
      new Modifier('cosmic-divinator-aura', game, card, {
        mixins: [
          new AuraModifierMixin(game, {
            isElligible(candidate) {
              return card.location === 'board' && candidate.equals(card.player.hero);
            },
            async onGainAura(candidate) {
              await candidate.modifiers.add(
                new SimpleSpellpowerBuffModifier(MODIFIER_ID, game, card, { amount: 2 })
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
  async onPlay(game, card) {
    if (card.isPlayedFromHand) {
      await card.player.spendRune({ KNOWLEDGE: 1 });
    }
  }
};
