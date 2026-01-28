import dedent from 'dedent';
import { SpellDamage } from '../../../../../utils/damage';
import type { SpellBlueprint } from '../../../../card-blueprint';
import { singleEnemyMinionTargetRules } from '../../../../card-utils';
import {
  CARD_SPEED,
  CARD_KINDS,
  CARD_DECK_SOURCES,
  CARD_SETS,
  RARITIES,
  FACTIONS
} from '../../../../card.enums';
import type { MinionCard } from '../../../../entities/minion.entity';
import { FreezeModifier } from '../../../../../modifier/modifiers/freeze.modifier';

export const rayOfFrost: SpellBlueprint = {
  id: 'ray-of-frost',
  kind: CARD_KINDS.SPELL,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'Ray of Frost',
  description: dedent`
    Deal 1 damage to an enemy minion, and exhaust it. If it was already exhausted, @Freeze@ it instead.
  `,
  faction: FACTIONS.ARCANE,
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
      bg: 'spells/ray-of-frost-bg',
      main: 'spells/ray-of-frost',
      frame: 'default',
      tint: FACTIONS.ARCANE.defaultCardTint
    }
  },
  manaCost: 2,
  speed: CARD_SPEED.FAST,
  abilities: [],
  canPlay(game, card) {
    return singleEnemyMinionTargetRules.canPlay(game, card);
  },
  getPreResponseTargets(game, card) {
    return singleEnemyMinionTargetRules.getPreResponseTargets(game, card, {
      type: 'card',
      card
    });
  },
  async onInit() {},
  async onPlay(game, card, targets) {
    for (const target of targets as MinionCard[]) {
      await target.takeDamage(card, new SpellDamage(1, card));

      const wasExhausted = target.isExhausted;

      if (wasExhausted) {
        await target.modifiers.add(new FreezeModifier(game, card));
      } else {
        await target.exhaust();
      }
    }
  }
};
