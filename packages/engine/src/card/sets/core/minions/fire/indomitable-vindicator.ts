import dedent from 'dedent';
import { RuneCostToggleModifierMixin } from '../../../../../modifier/mixins/togglable.mixin';
import { UntilEndOfTurnModifierMixin } from '../../../../../modifier/mixins/until-end-of-turn.mixin';
import type { MinionBlueprint } from '../../../../card-blueprint';
import {
  defaultCardArt,
  isMinion,
  singleEnemyMinionTargetRules
} from '../../../../card-utils';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  JOBS,
  AFFINITIES,
  CARD_SPEED
} from '../../../../card.enums';
import { AbilityDamage } from '../../../../../utils/damage';
import { OnScoreModifier } from '../../../../../modifier/modifiers/on-score.modifier';
import { OnMoveModifier } from '../../../../../modifier/modifiers/on-move.modifier';
import { VulnerableModifier } from '../../../../../modifier/modifiers/vulnerable.modifier';
import { isDefined } from '@game/shared';

export const indomitableVindicator: MinionBlueprint = {
  id: 'indomitableVindicator',
  name: 'Indomitable Vindicator',
  description: dedent /*html*/ `
  <rt-keyword>On Score</rt-keyword> Deal 1 damage to all other minions on this battlefield.
  <rt-runes runes="might,resonance"></rt-runes> <rt-trigger>On Engage</rt-trigger> Give an enemy minion on the same battlefield <rt-keyword>Vulnerable</rt-keyword> this turn.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('minions/indomitable-vindicator'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.RARE,
  jobs: [JOBS.WARRIOR],
  affinities: [AFFINITIES.FIRE],
  manaCost: 3,
  runeCost: [],
  statRequirements: {},
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 2,
  maxHp: 3,
  commandment: 2,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new OnScoreModifier(game, card, {
        async handler(event) {
          const battlefield = event.data.battlefield;
          const targets = [...battlefield.spaces, ...battlefield.opponentSpaces]
            .map(space => space.card)
            .filter(isDefined)
            .filter(isMinion)
            .filter(minion => !minion.equals(card));

          for (const target of targets) {
            await target.takeDamage(card, new AbilityDamage(1));
          }
        }
      })
    );

    await card.modifiers.add(
      new OnMoveModifier(game, card, {
        location: 'battlefield',
        mixins: [new RuneCostToggleModifierMixin(game, card, { might: 1, resonance: 1 })],
        async handler() {
          const hasTarget = singleEnemyMinionTargetRules.canPlay(
            game,
            card,
            minion => minion.location === card.location
          );
          if (!hasTarget) return;

          const result = await singleEnemyMinionTargetRules.getTargets({
            game,
            card,
            label: 'Select an enemy minion to give Vulnerable',
            canCancel: false,
            timeoutFallback: singleEnemyMinionTargetRules.defaultTimeoutFallback(
              game,
              card,
              minion => minion.location === card.location
            ),
            predicate: minion => minion.location === card.location,
            aiHints: { shouldPick: () => 1 }
          });

          if (result.cancelled) return;

          for (const target of result.result.cards) {
            await target.modifiers.add(
              new VulnerableModifier(game, card, {
                amount: 1,
                mixins: [new UntilEndOfTurnModifierMixin(game)]
              })
            );
          }
        }
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
