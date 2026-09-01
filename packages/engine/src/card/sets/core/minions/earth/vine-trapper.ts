import dedent from 'dedent';
import type { MinionBlueprint } from '../../../../card-blueprint';
import { defaultCardArt, singleEnemyMinionTargetRules } from '../../../../card-utils';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  AFFINITIES,
  CARD_SPEED
} from '../../../../card.enums';
import { OnMoveModifier } from '../../../../../modifier/modifiers/on-move.modifier';
import { UntilEndOfTurnModifierMixin } from '../../../../../modifier/mixins/until-end-of-turn.mixin';
import { RootedModifier } from '../../../../../modifier/modifiers/rooted.modifier';

export const vineTrapper: MinionBlueprint = {
  id: 'vineTrapper',
  name: 'Vine Trapper',
  description: dedent /*html*/ `
  <rt-trigger>On Engage</rt-trigger>: Inflict <rt-keyword>Rooted</rt-keyword> to an enemy on the same battlefield until the end of the turn.
  <rt-runes runes="might,focus,resonance"></rt-runes> give it -1/+0/+0 as well.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.RARE,
  affinities: [AFFINITIES.EARTH],
  manaCost: 2,
  manaSupply: 2,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 2,
  maxHp: 3,
  commandment: 1,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new OnMoveModifier(game, card, {
        location: 'battlefield',
        async handler() {
          const hasTarget = singleEnemyMinionTargetRules.canPlay(
            game,
            card,
            minion => minion.location === card.location
          );

          if (!hasTarget) return;
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
          await target.result.cards[0]?.modifiers.add(
            new RootedModifier(game, card, {
              mixins: [new UntilEndOfTurnModifierMixin(game)]
            })
          );
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
