import dedent from 'dedent';
import type { MinionBlueprint } from '../../../../card-blueprint';
import {
  defaultCardArt,
  isOnBoard,
  singleMinionTargetRules
} from '../../../../card-utils';
import {
  AFFINITIES,
  CARD_KINDS,
  CARD_LOCATIONS,
  CARD_SETS,
  CARD_SPEED,
  JOBS,
  RARITIES
} from '../../../../card.enums';
import type { MinionCard } from '../../../../entities/minion.entity';
import { SimpleManacostModifier } from '../../../../../modifier/modifiers/simple-manacost-modifier';
import { TogglableModifierMixin } from '../../../../../modifier/mixins/togglable.mixin';
import { LevelBonusModifier } from '../../../../../modifier/modifiers/level-bonus.modifier';
import { JobBonusModifier } from '../../../../../modifier/modifiers/job-bonus.modifier';

export const healingMystic: MinionBlueprint = {
  id: 'healing_mystic',
  name: 'Healing Mystic',
  description: dedent`
    <rt-lvl-bonus lvl="2"><rt-job-bonus job="acolyte"> This costs 1 less.</rt-job-bonus></rt-lvl-bonus> 
    `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  jobs: [],
  affinity: AFFINITIES.NEUTRAL,
  manaCost: 2,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 2,
  maxHp: 3,
  abilities: [
    {
      id: 'healing-mystic-ability',
      label: 'Heal 2 damage',
      description: 'Heal a minion for 2.',
      manaCost: 1,
      canUse: (game, card) => {
        return isOnBoard(card) && singleMinionTargetRules.canPlay(game, card);
      },
      getTargets: (game, card) =>
        singleMinionTargetRules.getTargets({
          game,
          card,
          origin: { type: 'ability', abilityId: 'healing-mystic-ability', card },
          timeoutFallback: singleMinionTargetRules.defaultTimeoutFallback(game, card),
          canCancel: true,
          aiHints: {
            shouldPick: () => 1
          }
        }),
      async onResolve(game, card, targets) {
        for (const target of targets) {
          await (target as MinionCard).heal(2);
        }
      },
      aiHints: {
        shouldUse: () => 1
      }
    }
  ],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(new LevelBonusModifier(game, card, 2));
    const lvlMod = card.modifiers.get(LevelBonusModifier)!;
    await card.modifiers.add(new JobBonusModifier(game, card, JOBS.ACOLYTE.id));
    const jobMod = card.modifiers.get(JobBonusModifier)!;

    await card.modifiers.add(
      new SimpleManacostModifier('healing-mystic-discount', game, card, {
        amount: -2,
        mixins: [
          new TogglableModifierMixin(game, () => lvlMod.isActive && jobMod.isActive)
        ]
      })
    );
  },
  async onPlay(game, card) {},
  aiHints: {
    shouldPlay: () => 0,
    shouldMove: () => 0,
    shouldAttack: () => 0,
    getThreatScore: () => 0
  }
};
