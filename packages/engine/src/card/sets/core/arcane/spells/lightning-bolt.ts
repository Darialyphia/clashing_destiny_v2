import dedent from 'dedent';
import { SpellDamage, UnpreventableDamage } from '../../../../../utils/damage';
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
import { ForesightModifier } from '../../../../../modifier/modifiers/foresight.modifier';

export const lightningBolt: SpellBlueprint = {
  id: 'lightning-bolt',
  kind: CARD_KINDS.SPELL,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'Lightning Bolt',
  description: dedent`
  Deal 2 damage to an enemy minion and 1 @True Damage@ to all other enemy minions.
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
      bg: 'spells/lightning-bolt-bg',
      main: 'spells/lightning-bolt',
      frame: 'default',
      tint: FACTIONS.ARCANE.defaultCardTint
    }
  },
  manaCost: 3,
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
  async onInit(game, card) {
    await card.modifiers.add(new ForesightModifier(game, card));
  },
  async onPlay(game, card, targets) {
    const targetMinion = targets[0] as MinionCard;
    await targetMinion.takeDamage(card, new SpellDamage(2, card));
    for (const enemyMinion of targetMinion.player.minions) {
      if (enemyMinion.equals(targetMinion)) continue;
      await enemyMinion.takeDamage(card, new UnpreventableDamage(1));
    }
  }
};
