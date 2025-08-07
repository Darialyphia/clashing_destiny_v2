import { SpellDamage } from '../../../../utils/damage';
import type { SpellBlueprint } from '../../../card-blueprint';
import { singleEnemyMinionTargetRules } from '../../../card-utils';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES,
  SPELL_KINDS
} from '../../../card.enums';
import type { MinionCard } from '../../../entities/minion.entity';
import { TidesFavoredModifier } from '../../../../modifier/modifiers/tide-modifier';

export const shiftingCurrents: SpellBlueprint = {
  id: 'shifting-currents',
  name: 'Shifting Currents',
  cardIconId: 'spell-shifting-current',
  description: `Deal 1 damage to an enemy minion. Raise your @Tide@ level.`,
  collectable: true,
  unique: false,
  manaCost: 1,
  affinity: AFFINITIES.WATER,
  kind: CARD_KINDS.SPELL,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  subKind: SPELL_KINDS.BURST,
  tags: [],
  canPlay: singleEnemyMinionTargetRules.canPlay,
  getPreResponseTargets(game, card) {
    return singleEnemyMinionTargetRules.getPreResponseTargets(game, card, {
      type: 'card',
      card
    });
  },
  async onInit() {},
  async onPlay(game, card, targets) {
    const target = targets[0] as MinionCard;
    await target.takeDamage(card, new SpellDamage(1));
    await card.player.hero.modifiers.get(TidesFavoredModifier)?.raiseTides();
  }
};
