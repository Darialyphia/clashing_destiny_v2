import dedent from 'dedent';
import type { MinionBlueprint } from '../../../card-blueprint';
import { defaultCardArt } from '../../../card-utils';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  CARD_SPEED,
  AFFINITIES
} from '../../../card.enums';
import { OnMoveModifier } from '../../../../modifier/modifiers/on-move.modifier';
import { WhileOnBoardModifier } from '../../../../modifier/modifiers/while-on-board.modifier';
import { MinionInterceptorModifierMixin } from '../../../../modifier/mixins/interceptor.mixin';
import { UntilEndOfTurnModifierMixin } from '../../../../modifier/mixins/until-end-of-turn.mixin';
import { OnScoreModifier } from '../../../../modifier/modifiers/on-score.modifier';

export const fiz: MinionBlueprint = {
  id: 'fiz',
  name: 'Fiz',
  description: dedent /*html*/ `
  <rt-trigger>On Engage</rt-trigger>: This gains "Cannot be attacked" this turn.
  <rt-affinity affinities="Lyonar,Lyonar"></rt-affinity>
  <rt-trigger>On Score</rt-trigger>: Move this to your base.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('minions/fiz'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.RARE,
  manaCost: 2,
  manaSupply: 1,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 1,
  maxHp: 1,
  affinities: [AFFINITIES.LIGHT],
  commandment: 1,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new OnMoveModifier(game, card, {
        location: 'battlefield',
        fromlocation: 'base',
        async handler() {
          await card.modifiers.add(
            new WhileOnBoardModifier('fiz-protection', game, card, {
              mixins: [
                new MinionInterceptorModifierMixin(game, {
                  key: 'canBeAttacked',
                  interceptor: () => false
                }),
                new UntilEndOfTurnModifierMixin(game)
              ]
            })
          );
        }
      })
    );

    await card.modifiers.add(
      new OnScoreModifier(game, card, {
        async handler() {
          const emptySpaceInBase = card.player.boardSide.base.find(
            space => space.isEmpty
          );
          if (!emptySpaceInBase) return;
          await card.moveToSpace(emptySpaceInBase);
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
