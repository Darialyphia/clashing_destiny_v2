import dedent from 'dedent';
import type { SpellBlueprint } from '../../../../card-blueprint';
import {
  CARD_SPEED,
  CARD_KINDS,
  CARD_DECK_SOURCES,
  CARD_SETS,
  RARITIES,
  FACTIONS
} from '../../../../card.enums';
import { HonorModifier } from '../../../../../modifier/modifiers/honor.modifier';
import { UntilEndOfTurnModifierMixin } from '../../../../../modifier/mixins/until-end-of-turn.mixin';
import { LoyaltyModifier } from '../../../../../modifier/modifiers/loyalty.modifier';

export const protectTheHolySpire: SpellBlueprint = {
  id: 'protect-the-holy-spire',
  kind: CARD_KINDS.SPELL,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'Protect the Holy Spire',
  description: dedent`
    @Loyalty@: this costs 2 more.
    Grant @Honor@ and @Pusher@ to allied @minion@s until the end of the turn.
  `,
  faction: FACTIONS.ORDER,
  rarity: RARITIES.EPIC,
  tags: [],
  art: {
    default: {
      foil: {
        sheen: true,
        oil: true,
        gradient: true,
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
  manaCost: 4,
  speed: CARD_SPEED.SLOW,
  abilities: [],
  canPlay() {
    return true;
  },
  getPreResponseTargets() {
    return Promise.resolve([]);
  },
  async onInit(game, card) {
    await card.modifiers.add(
      new LoyaltyModifier(game, card, {
        manaAmount: 2
      })
    );
  },
  async onPlay(game, card) {
    const alliedMinions = card.player.boardSide.getAllMinions();

    for (const minion of alliedMinions) {
      await minion.modifiers.add(
        new HonorModifier(game, card, {
          mixins: [new UntilEndOfTurnModifierMixin(game)]
        })
      );
    }
  }
};
