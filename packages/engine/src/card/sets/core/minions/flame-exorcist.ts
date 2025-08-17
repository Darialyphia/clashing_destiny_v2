import { isDefined } from '@game/shared';
import { EmberModifier } from '../../../../modifier/modifiers/ember.modifier';
import { LevelBonusModifier } from '../../../../modifier/modifiers/level-bonus.modifier';
import { OnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import { AbilityDamage } from '../../../../utils/damage';
import type { MinionBlueprint } from '../../../card-blueprint';
import { singleEnemyTargetRules } from '../../../card-utils';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';

export const flameExorcist: MinionBlueprint = {
  id: 'flameExorcist',
  name: 'Flame Exorcist',
  cardIconId: 'unit-flame-exorcist',
  description: `@On Enter@ : deal 1 damage to a enemy. Consume one stack of @Ember@ to deal 2 damage instead.`,
  collectable: true,
  unique: false,
  manaCost: 2,
  atk: 2,
  maxHp: 1,
  rarity: RARITIES.COMMON,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  affinity: AFFINITIES.FIRE,
  setId: CARD_SETS.CORE,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new OnEnterModifier(game, card, {
        async handler() {
          const hasTarget = singleEnemyTargetRules.canPlay(game, card);
          if (!hasTarget) return;

          const [target] = await singleEnemyTargetRules.getPreResponseTargets(
            game,
            card,
            { type: 'card', card }
          );
          const emberModifier = card.player.hero.modifiers.get(EmberModifier);
          await emberModifier?.removeStacks(1);
          await target.takeDamage(
            card,
            new AbilityDamage(isDefined(emberModifier) ? 2 : 1)
          );
        }
      })
    );
  },
  async onPlay() {}
};
