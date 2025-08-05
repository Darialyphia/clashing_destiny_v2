import { EmberModifier } from '../../../../modifier/modifiers/ember.modifier';
import { SpellDamage } from '../../../../utils/damage';
import type { SpellBlueprint } from '../../../card-blueprint';
import { isMinion, singleEnemyTargetRules } from '../../../card-utils';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES,
  SPELL_KINDS
} from '../../../card.enums';
import type { MinionCard } from '../../../entities/minion.entity';

export const fireBolt: SpellBlueprint = {
  id: 'fire-bolt',
  name: 'Fire Bolt',
  cardIconId: 'spell-fire-bolt',
  description:
    'Deal 1 damage to a target enemy. If it destroys the target, add a stack of @Ember@ to your hero.',
  collectable: true,
  unique: false,
  manaCost: 1,
  affinity: AFFINITIES.FIRE,
  kind: CARD_KINDS.SPELL,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  subKind: SPELL_KINDS.BURST,
  tags: [],
  canPlay: singleEnemyTargetRules.canPlay,
  getPreResponseTargets(game, card) {
    return singleEnemyTargetRules.getPreResponseTargets(game, card, {
      type: 'card',
      card
    });
  },
  async onInit() {},
  async onPlay(game, card, targets) {
    const target = targets[0] as MinionCard;
    await target.takeDamage(card, new SpellDamage(1));
    if (!target.isAlive) {
      await card.player.hero.modifiers.add(new EmberModifier(game, card));
    }
  }
};
