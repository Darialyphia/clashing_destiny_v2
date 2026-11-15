import dedent from 'dedent';
import type { MinionBlueprint } from '../../../card-blueprint';
import { defaultCardArt } from '../../../card-utils';
import { CARD_SETS, CARD_KINDS, RARITIES, CARD_SPEED } from '../../../card.enums';
import { OnMoveModifier } from '../../../../modifier/modifiers/on-move.modifier';
import { WhileOnBoardModifier } from '../../../../modifier/modifiers/while-on-board.modifier';
import { MinionInterceptorModifierMixin } from '../../../../modifier/mixins/interceptor.mixin';
import { UntilEndOfTurnModifierMixin } from '../../../../modifier/mixins/until-end-of-turn.mixin';
import { FACTION_IDS } from '../../../factions/factions';
import { OnScoreModifier } from '../../../../modifier/modifiers/on-score.modifier';
import { LevelTogglableModifierMixin } from '../../../../modifier/mixins/togglable.mixin';

export const fiz: MinionBlueprint = {
  id: 'fiz',
  name: 'Fiz',
  description: dedent /*html*/ `
  <rt-trigger>On Engage</rt-trigger>: I gain "Cannot be attacked" this turn.
  <rt-level-bonus level="3"></rt-level-bonus><rt-trigger>On Score</rt-trigger>: Move me to your base.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('minions/fiz'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.RARE,
  manaCost: 1,
  manaSupply: 2,
  level: 1,
  exp: 1,
  factionId: FACTION_IDS.LYONAR,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 1,
  maxHp: 1,
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
        },
        mixins: [new LevelTogglableModifierMixin(game, 3)]
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
