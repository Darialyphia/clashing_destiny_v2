import dedent from 'dedent';
import { SpellDamage } from '../../../../../utils/damage';
import type { SpellBlueprint } from '../../../../card-blueprint';
import { singleEnemyTargetRules } from '../../../../card-utils';
import {
  CARD_SPEED,
  CARD_KINDS,
  CARD_DECK_SOURCES,
  CARD_SETS,
  RARITIES,
  FACTIONS
} from '../../../../card.enums';
import type { MinionCard } from '../../../../entities/minion.entity';
import { ForesightModifier } from '../../../../../modifier/modifiers/foresight.modifier';

export const magicMissile: SpellBlueprint = {
  id: 'magic-missile',
  kind: CARD_KINDS.SPELL,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'Magic Missile',
  description: dedent`Deal 1 damage to an enemy.`,
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
      bg: 'placeholder-bg',
      main: 'placeholder',
      breakout: 'placeholder-breakout',
      frame: 'default',
      tint: FACTIONS.ARCANE.defaultCardTint
    }
  },
  manaCost: 1,
  runeCost: {
    KNOWLEDGE: 1
  },
  speed: CARD_SPEED.FAST,
  abilities: [],
  canPlay(game, card) {
    return singleEnemyTargetRules.canPlay(game, card);
  },
  getPreResponseTargets(game, card) {
    return singleEnemyTargetRules.getPreResponseTargets(game, card, {
      type: 'card',
      card
    });
  },
  async onInit(game, card) {
    await card.modifiers.add(new ForesightModifier(game, card));
  },
  async onPlay(game, card, targets) {
    for (const target of targets as MinionCard[]) {
      await target.takeDamage(card, new SpellDamage(1, card));
    }
  }
};
