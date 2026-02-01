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
import { LevelBonusModifier } from '../../../../../modifier/modifiers/level-bonus.modifier';
import { frontlineSkirmisher } from '../minions/frontline-skirmisher';

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
    Grant @Honor@ to allied @minion@s until the end of the turn.
    @[lvl] 2 bonus@: Summon 2 copies of @${frontlineSkirmisher.name}@.
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

    await card.modifiers.add(new LevelBonusModifier(game, card, 2));
  },
  async onPlay(game, card) {
    const lvlMod = card.modifiers.get(LevelBonusModifier);

    if (lvlMod?.isActive) {
      await (await card.player.generateCard(frontlineSkirmisher.id)).addToHand();
      await (await card.player.generateCard(frontlineSkirmisher.id)).addToHand();
    }

    const alliedMinions = card.player.boardSide.minions;

    for (const minion of alliedMinions) {
      await minion.modifiers.add(
        new HonorModifier(game, card, {
          mixins: [new UntilEndOfTurnModifierMixin(game)]
        })
      );
    }
  }
};
