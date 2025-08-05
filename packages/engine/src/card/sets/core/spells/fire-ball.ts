import { BurnModifier } from '../../../../modifier/modifiers/burn.modifier';
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

export const fireBall: SpellBlueprint = {
  id: 'fire-ball',
  name: 'Fire Ball',
  cardIconId: 'spell-fireball',
  description: `Deal 3 damage to an enemy minion. Inflict @Burn@ to adjacent minions.`,
  collectable: true,
  unique: false,
  manaCost: 4,
  affinity: AFFINITIES.FIRE,
  kind: CARD_KINDS.SPELL,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.RARE,
  subKind: SPELL_KINDS.CAST,
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
    const adjacentMinions = target.slot?.adjacentMinions ?? [];
    await target.takeDamage(card, new SpellDamage(3));

    for (const minion of adjacentMinions) {
      await minion.modifiers.add(new BurnModifier(game, card));
    }
  }
};
