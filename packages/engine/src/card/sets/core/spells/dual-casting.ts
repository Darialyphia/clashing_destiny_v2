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
import type { HeroCard } from '../../../entities/hero.entity';
import type { MinionCard } from '../../../entities/minion.card';

export const dualCasting: SpellBlueprint<MinionCard | HeroCard> = {
  id: 'dual-casting',
  name: 'Dual Casting',
  cardIconId: 'dual-casting',
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
  getPreResponseTargets: multipleEnemyTargetRules.getPreResponseTargets({
    min: 1,
    max: 2,
    allowRepeat: false
  }),
  async onInit() {},
  async onPlay(game, card, targets) {
    for (const target of targets) {
      await target.takeDamage(card, new SpellDamage(1));
    }
  }
};
