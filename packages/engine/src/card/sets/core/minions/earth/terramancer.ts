import dedent from 'dedent';
import { RuneCostToggleModifierMixin } from '../../../../../modifier/mixins/togglable.mixin';
import type { MinionBlueprint } from '../../../../card-blueprint';
import { defaultCardArt, singleEnemyMinionTargetRules } from '../../../../card-utils';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  JOBS,
  AFFINITIES,
  CARD_SPEED
} from '../../../../card.enums';
import { OnMoveModifier } from '../../../../../modifier/modifiers/on-move.modifier';
import { askMandatoryYesNoQuestion } from '../../../../card-actions-utils';
import { RushModifier } from '../../../../../modifier/modifiers/rush.modifier';

export const terramancer: MinionBlueprint = {
  id: 'terramancer',
  name: 'Terramancer',
  description: dedent /*html*/ `
  <rt-keyword>On Engage</rt-keyword> you may exhaust this card to exhaust an enemy minion on the same battlefield.
  <br/>
  <rt-runes runes="might,focus"></rt-runes> <rt-keyword>Rush 1</rt-keyword>.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.RARE,
  jobs: [JOBS.MAGE],
  affinities: [AFFINITIES.EARTH],
  manaCost: 3,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 2,
  maxHp: 4,
  commandment: 1,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new OnMoveModifier(game, card, {
        location: 'battlefield',
        async handler() {
          if (card.player.manaManager.mana < 1) return;
          const hasTarget = singleEnemyMinionTargetRules.canPlay(
            game,
            card,
            minion => minion.location === card.location
          );

          if (!hasTarget) return;

          const shouldExhaust = await askMandatoryYesNoQuestion({
            game,
            card,
            questionId: 'terramancer',
            label: 'Exhaust this and an enemy minion on the same battlefield?',
            aiChoice: 'yes',
            timeoutFallback: 'no'
          });

          if (!shouldExhaust) return;

          const target = await singleEnemyMinionTargetRules.getTargets({
            game,
            card,
            canCancel: false,
            label: 'Select an enemy minion to root',
            timeoutFallback: [],
            aiHints: {
              shouldPick: () => 1
            },
            predicate: minion => minion.location === card.location
          });

          if (!target) return;
          if (target.cancelled) return;

          await card.exhaust();
          await target.result.cards[0]?.exhaust();
        }
      })
    );

    await card.modifiers.add(
      new RushModifier(game, card, {
        cost: 1,
        mixins: [
          new RuneCostToggleModifierMixin(game, card, {
            might: 1,
            focus: 1
          })
        ]
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
