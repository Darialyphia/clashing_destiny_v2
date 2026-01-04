import dedent from 'dedent';
import type { SpellBlueprint } from '../../../../card-blueprint';
import { singleAllyMinionTargetRules } from '../../../../card-utils';
import {
  CARD_SPEED,
  CARD_KINDS,
  CARD_DECK_SOURCES,
  CARD_SETS,
  RARITIES,
  FACTIONS
} from '../../../../card.enums';
import type { MinionCard } from '../../../../entities/minion.entity';
import { DrifterModifier } from '../../../../../modifier/modifiers/drifter.modifier';

export const angelWings: SpellBlueprint = {
  id: 'angel-wings',
  kind: CARD_KINDS.SPELL,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'Angel Wings',
  description: dedent`
    Grant @Drifter@ to an ally @minion@.
    Draw a card into your Destiny zone.
  `,
  faction: FACTIONS.ORDER,
  rarity: RARITIES.COMMON,
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
  manaCost: 1,
  speed: CARD_SPEED.FAST,
  abilities: [],
  canPlay(game, card) {
    return singleAllyMinionTargetRules.canPlay(game, card);
  },
  getPreResponseTargets(game, card) {
    return singleAllyMinionTargetRules.getPreResponseTargets(game, card, {
      type: 'card',
      card
    });
  },
  async onInit() {},
  async onPlay(game, card, targets) {
    for (const target of targets as MinionCard[]) {
      await target.modifiers.add(new DrifterModifier(game, card));
    }

    await card.player.cardManager.drawIntoDestinyZone(1);
  }
};
