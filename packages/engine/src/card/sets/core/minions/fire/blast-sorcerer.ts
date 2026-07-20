import dedent from 'dedent';
import type { MinionBlueprint } from '../../../../card-blueprint';
import { defaultCardArt, singleMinionTargetRules } from '../../../../card-utils';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  AFFINITIES,
  CARD_SPEED,
  JOBS
} from '../../../../card.enums';
import { SimpleManacostModifier } from '../../../../../modifier/modifiers/simple-manacost-modifier';
import { RuneCostToggleModifierMixin } from '../../../../../modifier/mixins/togglable.mixin';
import { BlastModifier } from '../../../../../modifier/modifiers/blast.modifier';
import { UntilEndOfTurnModifierMixin } from '../../../../../modifier/mixins/until-end-of-turn.mixin';

export const blastSorcerer: MinionBlueprint = {
  id: 'blast-sorcerer',
  name: 'Blast Sorcerer',
  description: dedent /*html*/ `
  <rt-runes runes="wisdom,wisdom,focus"></rt-runes> This costs 2 less.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  jobs: [JOBS.MAGE],
  affinities: [AFFINITIES.FIRE],
  manaCost: 5,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 4,
  maxHp: 2,
  commandment: 2,
  canPlay: () => true,
  abilities: [
    {
      id: 'blast-sorcerer',
      label: 'Give a minion blast 2',
      description: 'Give a minion <rt-keyword>Blast 2</rt-keyword> this turn',
      manaCost: 2,
      shouldExhaust: true,
      canUse(game, card) {
        return singleMinionTargetRules.canPlay(game, card);
      },
      getTargets(game, card) {
        return singleMinionTargetRules.getTargets({
          game,
          card,
          timeoutFallback: [],
          aiHints: { shouldPick: () => 1 }
        });
      },
      async onResolve(game, card, targets) {
        for (const target of targets.cards) {
          await target.modifiers.add(
            new BlastModifier(game, card, {
              amount: 2,
              mixins: [new UntilEndOfTurnModifierMixin(game)]
            })
          );
        }
      },
      aiHints: {
        shouldUse: () => 1
      }
    }
  ],
  async onInit(game, card) {
    await card.modifiers.add(
      new SimpleManacostModifier('blast-sorcerer-cost-reduction', game, card, {
        amount: -2,
        mixins: [new RuneCostToggleModifierMixin(game, card, { wisdom: 2, focus: 1 })]
      })
    );
  },
  async onPlay() {},
  aiHints: {
    shouldPlay: () => 1,
    shouldAttack: () => 1,
    shouldMove: () => 1,
    getThreatScore: () => 1
  }
};
