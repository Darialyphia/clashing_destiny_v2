import { SpellDamage } from '../../../../utils/damage';
import type { SpellBlueprint } from '../../../card-blueprint';
import { multipleEnemyTargetRules } from '../../../card-utils';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES,
  SPELL_KINDS
} from '../../../card.enums';
import type { MinionCard } from '../../../entities/minion.entity';

export const dualCasting: SpellBlueprint = {
  id: 'dual-casting',
  name: 'Dual Casting',
  cardIconId: 'spell-dual-casting',
  description: 'Deal 1 damage to up to 2 enemies.',
  collectable: true,
  unique: false,
  manaCost: 2,
  affinity: AFFINITIES.ARCANE,
  kind: CARD_KINDS.SPELL,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  subKind: SPELL_KINDS.BURST,
  tags: [],
  canPlay: multipleEnemyTargetRules.canPlay(1),
  getPreResponseTargets(game, card) {
    return multipleEnemyTargetRules.getPreResponseTargets({
      min: 1,
      max: 2,
      allowRepeat: false
    })(game, card, { type: 'card', card });
  },
  async onInit() {},
  async onPlay(game, card, targets) {
    for (const target of targets as MinionCard[]) {
      await target.takeDamage(card, new SpellDamage(1));
    }
  }
};
