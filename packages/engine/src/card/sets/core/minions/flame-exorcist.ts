import { BurnModifier } from '../../../../modifier/modifiers/burn.modifier';
import { EchoedDestinyModifier } from '../../../../modifier/modifiers/echoed-destiny.modifier';
import { EmberModifier } from '../../../../modifier/modifiers/ember.modifier';
import { LevelBonusModifier } from '../../../../modifier/modifiers/level-bonus.modifier';
import { AbilityDamage } from '../../../../utils/damage';
import type { MinionBlueprint } from '../../../card-blueprint';
import { singleEnemyTargetRules, singleMinionTargetRules } from '../../../card-utils';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';
import type { HeroCard } from '../../../entities/hero.entity';
import { MinionCard } from '../../../entities/minion.entity';

export const flameExorcist: MinionBlueprint = {
  id: 'flameExorcist',
  name: 'Flame Exorcist',
  cardIconId: 'unit-flame-exorcist',
  description: ``,
  collectable: true,
  unique: false,
  manaCost: 2,
  atk: 1,
  maxHp: 2,
  rarity: RARITIES.COMMON,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  affinity: AFFINITIES.FIRE,
  setId: CARD_SETS.CORE,
  abilities: [
    {
      id: 'ability',
      label: '@[exhaust]@ : Deal 1 damage',
      description: `@[exhaust]@ Consume 1 @Ember@ stack from your hero to deal 1 damage to a enemy. @[level] 4+@ deal 2 damage instead.`,
      canUse: (game, card) =>
        card.location === 'board' &&
        singleEnemyTargetRules.canPlay(game, card) &&
        (card.player.hero.modifiers.get(EmberModifier)?.stacks ?? 0) > 0,
      getPreResponseTargets(game, card) {
        return singleEnemyTargetRules.getPreResponseTargets(game, card, {
          type: 'ability',
          card,
          abilityId: 'ability'
        });
      },
      manaCost: 0,
      shouldExhaust: true,
      async onResolve(game, card, targets) {
        const emberModifier = card.player.hero.modifiers.get(EmberModifier);
        if (!emberModifier || emberModifier.stacks < 1) return;
        await emberModifier.removeStacks(1);
        const levelMod = card.modifiers.get(LevelBonusModifier);
        const target = targets[0] as MinionCard | HeroCard;
        await target.takeDamage(card, new AbilityDamage(levelMod?.isActive ? 2 : 1));
      }
    }
  ],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(new LevelBonusModifier(game, card, 4));
  },
  async onPlay() {}
};
