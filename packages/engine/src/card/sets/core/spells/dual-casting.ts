import dedent from 'dedent';
import { SpellDamage } from '../../../../utils/damage';
import type { SpellBlueprint } from '../../../card-blueprint';
import { multipleEnemyTargetRules } from '../../../card-utils';
import {
  SPELL_SCHOOLS,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';
import type { MinionCard } from '../../../entities/minion.entity';

export const dualCasting: SpellBlueprint = {
  id: 'dual-casting',
  name: 'Dual Casting',
  cardIconId: 'spells/dual-casting',
  description: dedent`
  Deal 1 damage to 2 enemy targets.
  `,
  collectable: true,
  unique: false,
  manaCost: 1,
  speed: CARD_SPEED.FAST,
  spellSchool: SPELL_SCHOOLS.ARCANE,
  job: null,
  kind: CARD_KINDS.SPELL,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  tags: [],
  abilities: [],
  canPlay: multipleEnemyTargetRules.canPlay(2),
  getPreResponseTargets(game, card) {
    return multipleEnemyTargetRules.getPreResponseTargets({
      min: 2,
      max: 2,
      allowRepeat: false
    })(game, card, {
      type: 'card',
      card
    });
  },
  async onInit() {},
  async onPlay(game, card, targets) {
    for (const target of targets as MinionCard[]) {
      await target.takeDamage(card, new SpellDamage(1, card));
    }
  }
};
