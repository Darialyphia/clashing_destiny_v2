import type { MinionCard } from '@game/engine/src/card/entities/minion.entity';
import type { TutorialMission } from '.';
import { makeTutorialDeck } from './utils';

export const basicsTutorial: TutorialMission = {
  id: 'play-card',
  name: 'Mission 1: Basics',
  options: {
    gameOptions: {
      players: [
        {
          id: 'p1',
          name: 'You',
          deck: {
            cards: makeTutorialDeck([
              ['tutorial-windblade-adept', 20],
              ['tutorial-silverguard-outpost', 1]
            ])
          }
        },
        {
          id: 'p2',
          name: 'Opponent',
          deck: {
            cards: makeTutorialDeck([
              ['bloodbound-invader', 20],
              ['tutorial-silverguard-outpost', 1]
            ])
          }
        }
      ],
      rngSeed: 'tutorial-seed',
      history: [],
      overrides: {
        config: {
          SHOULD_ROTATE_DESTINIES: false,
          SHUFFLE_DECK_ON_GAME_START: false,
          CARDS_DRAWN_PER_TURN: 0,
          CARDS_MULLIGANED_PER_TURN: 0,
          INITIAL_HAND_SIZE: 0,
          PLAYER_1_CARDS_DRAWN_ON_FIRST_TURN: 0,
          PLAYER_2_CARDS_DRAWN_ON_FIRST_TURN: 0,
          START_OF_GAME_MULLIGANED_CARDS: 0,
          VICTORY_POINTS_TO_WIN: 2
        }
      }
    },
    meta: {},
    steps: [
      {
        id: 0,
        canRetry: () => false,
        failedCondition: () => false,
        meta: {},
        async setup(ctx) {
          console.log(ctx);
          const [allyUnit] =
            ctx.game.playerSystem.player1.cardManager.mainDeck.draw(1);
          const [enemyUnit] =
            ctx.game.playerSystem.player2.cardManager.mainDeck.draw(1);
          await (allyUnit as MinionCard).playImmediatelyAt(
            ctx.game.playerSystem.player1.boardSide.base[2],
            { shouldExhaust: false }
          );
          await (enemyUnit as MinionCard).playImmediatelyAt(
            ctx.game.playerSystem.player2.boardSide.base[2],
            { shouldExhaust: false }
          );
          await ctx.game.snapshotSystem.takeSnapshot();
        },
        teardown() {},
        solveCondition(ctx) {
          return false;
        },
        validateInput(input, ctx) {
          return {
            isValid: false,
            reason: 'todo'
          };
        },
        textBoxes: [
          {
            text: 'The Bloodbound invaders are trying to take over our outpost!',
            right: '5%',
            bottom: '35%',
            canManuallyAdvance: true
          }
        ]
      }
    ]
  }
};
