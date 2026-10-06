import type { MinionCard } from '@game/engine/src/card/entities/minion.entity';
import type { TutorialMission } from '.';
import { makeTutorialDeck } from './utils';
import { isDefined, waitFor } from '@game/shared';
import { CARD_LOCATIONS } from '@game/engine/src/card/card.enums';

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
          CARDS_DRAWN_PER_TURN: 2,
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
          return isDefined(
            ctx.game.playerSystem.player1.boardSide.leftBattlefield.spaces[1]
              .card
          );
        },
        validateInput(input) {
          if (input.type !== 'move') {
            return {
              isValid: false,
              reason: 'Move your creature to the specified space'
            };
          }
          if (
            input.payload.zone !== CARD_LOCATIONS.LEFT_BATTLEFIELD ||
            input.payload.index !== 1
          ) {
            return {
              isValid: false,
              reason: 'Move your creature to the designated space'
            };
          }
          return {
            isValid: true
          };
        },
        textBoxes: [
          {
            text: 'The Bloodbound invaders are trying to take over our outpost!',
            right: '13%',
            bottom: '40%',
            canManuallyAdvance: true
          },
          {
            text: 'Use your minions to defend our position!',
            right: '13%',
            bottom: '40%',
            canManuallyAdvance: false,
            advanceCondition() {
              return false;
            },
            gesture: {
              from: ctx =>
                ctx.client.ui.DOMSelectors.boardSpace('p1-base-2').element!,
              to: ctx =>
                ctx.client.ui.DOMSelectors.boardSpace('p1-left_battlefield-1')
                  .element!
            }
          }
        ]
      },
      {
        id: 1,
        canRetry: () => false,
        failedCondition: () => false,
        meta: {},
        async setup() {},
        teardown() {},
        solveCondition(ctx) {
          return (
            ctx.game.playerSystem.player1.boardSide.leftBattlefield
              .commandmentScore === 2
          );
        },
        validateInput(input) {
          if (input.type !== 'score') {
            return {
              isValid: false,
              reason: 'You should score to strengthen your position'
            };
          }
          return {
            isValid: true
          };
        },
        textBoxes: [
          {
            text: 'The opponent is making his move !',
            right: '13%',
            bottom: '40%',
            canManuallyAdvance: true,
            async onEnter(ctx) {
              await waitFor(1500);
              const enemyMinion = ctx.game.playerSystem.player2.boardSide
                .base[2].card as MinionCard;
              await enemyMinion.moveManually(
                CARD_LOCATIONS.LEFT_BATTLEFIELD,
                1
              );
            }
          },
          {
            text: 'You need to <b>SCORE</b> to strengthen your position!',
            right: '13%',
            bottom: '40%',
            canManuallyAdvance: false,
            advanceCondition() {
              return false;
            },
            gesture: {
              from: ctx =>
                ctx.client.ui.DOMSelectors.boardSpace('p1-left_battlefield-1')
                  .element!,
              to: ctx =>
                ctx.client.ui.DOMSelectors.cardOnBoard(
                  ctx.game.playerSystem.player1.boardSide.leftBattlefield
                    .destinyCard!.id
                ).element!
            }
          }
        ]
      },
      {
        id: 2,
        canRetry: () => false,
        failedCondition: () => false,
        meta: {},
        async setup() {},
        teardown() {},
        solveCondition(ctx) {
          return ctx.game.turnSystem.initiativePlayer.equals(
            ctx.game.playerSystem.player2
          );
        },
        validateInput(input) {
          if (input.type !== 'pass') {
            return {
              isValid: false,
              reason: 'Pass your turn'
            };
          }
          return {
            isValid: true
          };
        },
        textBoxes: [
          {
            text: 'When you <b>SCORE</b>, you gain <b>INFLUENCE</b> on the battlefield.',
            right: '13%',
            bottom: '40%',
            canManuallyAdvance: true,
            async onEnter(ctx) {
              await waitFor(500);
              ctx.client.ui.highlightedElement =
                ctx.client.ui.DOMSelectors.influence(
                  ctx.game.playerSystem.player1.id,
                  'left_battlefield'
                ).element!;
            }
          },
          {
            text: "The amount of influence gained is equal to the minion's influence.",
            right: '13%',
            bottom: '40%',
            canManuallyAdvance: true,
            onEnter(ctx) {
              const card =
                ctx.game.playerSystem.player1.boardSide.leftBattlefield
                  .spaces[1].card!;
              console.log(
                ctx.client.ui.DOMSelectors.cardCommandment(card.id),
                ctx.client.ui.DOMSelectors.cardCommandment(card.id).element
              );
              ctx.client.ui.highlightedElement =
                ctx.client.ui.DOMSelectors.cardCommandment(card.id).element;
            }
          },
          {
            text: 'At the end of the turn, the player with the most Influence gains 1 <b>VICTORY POINT</b>',
            right: '13%',
            bottom: '40%',
            canManuallyAdvance: true,
            onEnter(ctx) {
              ctx.client.ui.highlightedElement = null;
            }
          },
          {
            text: 'Fill up your Victory Points gauge to win the game!',
            left: '-5%',
            bottom: '25%',
            canManuallyAdvance: true,
            onEnter(ctx) {
              ctx.client.ui.highlightedElement =
                ctx.client.ui.DOMSelectors.victoryPoints(
                  ctx.game.playerSystem.player1.id
                ).element!;
            }
          },
          {
            text: 'The enemy scored as well! You are now tied in influence.',
            left: '40%',
            top: '5%',
            hideDuringOpponentInitiative: true,
            canManuallyAdvance: true,
            async onEnter(ctx) {
              ctx.client.ui.highlightedElement = null;
              await waitFor(2000);
              ctx.game.dispatch({
                type: 'score',
                payload: {
                  playerId: ctx.game.playerSystem.player2.id,
                  minionId:
                    ctx.game.playerSystem.player2.boardSide.leftBattlefield
                      .spaces[1].card!.id
                }
              });
            }
          },
          {
            text: 'After Scoring, a minion is <b>EXHAUSTED</b> and cannot act anymore this turn.',
            left: '40%',
            top: '5%',
            canManuallyAdvance: true
          },
          {
            text: "We have nothing else to do this turn. Let's pass.",
            left: '0%',
            bottom: '35%',
            canManuallyAdvance: false,
            advanceCondition() {
              return false;
            },
            onEnter(ctx) {
              ctx.client.ui.highlightedElement =
                ctx.client.ui.DOMSelectors.passButton.element!;
            }
          }
        ]
      },
      {
        id: 3,
        canRetry: () => false,
        failedCondition: () => false,
        meta: {},
        async setup() {},
        teardown() {},
        solveCondition(ctx) {
          return isDefined(
            ctx.game.playerSystem.player1.boardSide.base[2].card
          );
        },
        validateInput(input, ctx) {
          const gamePhaseState = ctx.game.gamePhaseSystem.getState();
          if (gamePhaseState === 'main_phase') {
            if (input.type !== 'declarePlayCard') {
              return {
                isValid: false,
                reason: 'Play the Windblade Adept in your hand.'
              };
            }
          } else {
            if (
              input.type !== 'selectSpaceOnBoard' &&
              input.type !== 'cancelInteraction' &&
              input.type !== 'cancelPlayingCard'
            ) {
              return {
                isValid: false,
                reason: 'Drag your minion on the highlighted space.'
              };
            }
          }
          return {
            isValid: true
          };
        },
        textBoxes: [
          {
            text: 'If the enemy passes as well, the turn will end.',
            right: '13%',
            bottom: '40%',
            canManuallyAdvance: true
          },
          {
            text: 'At the start of each turn, influence on the battlefield resets.',
            right: '13%',
            bottom: '40%',
            canManuallyAdvance: true,
            onEnter(ctx) {
              ctx.client.ui.highlightedElement =
                ctx.client.ui.DOMSelectors.cardOnBoard(
                  ctx.game.playerSystem.player1.boardSide.leftBattlefield
                    .destinyCard!.id
                ).element!;
              ctx.game.dispatch({
                type: 'pass',
                payload: {
                  playerId: ctx.game.playerSystem.player2.id
                }
              });
            }
          },
          {
            text: "We managed to hold our ground and prevent the opponent from gaining a Victory Point, but now it's time to go on the offensive.",
            right: '13%',
            bottom: '40%',
            canManuallyAdvance: true,
            onEnter(ctx) {
              ctx.client.ui.highlightedElement = null;
            }
          },

          {
            text: "You got some reinforcements! Let's use them to turn the tides of battle!",
            right: '13%',
            bottom: '40%',
            canManuallyAdvance: true,
            onEnter(ctx) {
              ctx.client.ui.highlightedElement =
                ctx.client.ui.DOMSelectors.hand(
                  ctx.game.playerSystem.player1.id
                ).element!;
            }
          },
          {
            text: 'Drag your new minion onto the board to play it.',
            right: '13%',
            bottom: '40%',
            canManuallyAdvance: false,
            advanceCondition() {
              return false;
            },
            async onEnter(ctx) {
              ctx.client.ui.highlightedElement = null;
              await ctx.game.turnSystem.pass(ctx.game.playerSystem.player2);
              await ctx.game.snapshotSystem.takeSnapshot();
            },
            gesture: {
              from(ctx) {
                const cardInHand =
                  ctx.game.playerSystem.player1.cardManager.hand[0];
                if (!cardInHand) return null;
                return ctx.client.ui.DOMSelectors.cardInHand(
                  cardInHand.id,
                  ctx.game.playerSystem.player1.id
                ).element!;
              },
              to(ctx) {
                return ctx.client.ui.DOMSelectors.boardSpace(
                  ctx.game.playerSystem.player1.boardSide.base[2].id
                ).element!;
              }
            }
          }
        ]
      },
      {
        id: 4,
        canRetry: () => false,
        failedCondition: () => false,
        meta: {},
        async setup() {},
        teardown() {},
        solveCondition(ctx) {
          return !!ctx.game.playerSystem.player1.boardSide.leftBattlefield
            .spaces[1].card?.isExhausted;
        },
        validateInput(input) {
          if (input.type !== 'declareAttack') {
            return {
              isValid: false,
              reason: 'Declare an attack on the enemy Bloodbound Invader.'
            };
          }
          return {
            isValid: true
          };
        },
        textBoxes: [
          {
            text: 'Minions are played in your <b>Base</b>.',
            right: '13%',
            bottom: '40%',
            canManuallyAdvance: true
          },
          {
            text: 'Your opponent chose to score again. Time to take advantage of this!',
            right: '13%',
            bottom: '40%',
            canManuallyAdvance: true,
            hideDuringOpponentInitiative: true,
            async onEnter(ctx) {
              await waitFor(1000);
              ctx.game.dispatch({
                type: 'score',
                payload: {
                  playerId: ctx.game.playerSystem.player2.id,
                  minionId:
                    ctx.game.playerSystem.player2.boardSide.leftBattlefield
                      .spaces[1].card!.id
                }
              });
            }
          },
          {
            text: 'You can attack enemy minions with your own minions on the battlefield.',
            right: '13%',
            bottom: '40%',
            canManuallyAdvance: false,
            advanceCondition() {
              return false;
            },
            gesture: {
              from: ctx =>
                ctx.client.ui.DOMSelectors.boardSpace('p1-left_battlefield-1')
                  .element!,
              to: ctx =>
                ctx.client.ui.DOMSelectors.boardSpace('p2-left_battlefield-1')
                  .element!
            }
          }
        ]
      },
      {
        id: 5,
        canRetry: () => false,
        failedCondition: () => false,
        meta: {},
        async setup() {},
        teardown() {},
        solveCondition() {
          return false;
        },
        validateInput() {
          return {
            isValid: true
          };
        },
        textBoxes: [
          {
            text: 'When a minion attacks, it deals damage to the enemy equal to its attack.',
            right: '13%',
            bottom: '40%',
            canManuallyAdvance: true,
            onEnter(ctx) {
              const card =
                ctx.game.playerSystem.player1.boardSide.leftBattlefield
                  .spaces[1].card!;
              ctx.client.ui.highlightedElement =
                ctx.client.ui.DOMSelectors.cardAttack(card.id).element;
            }
          },
          {
            text: 'When a minion has taken more damage than its health, it is destroyed.',
            right: '13%',
            bottom: '40%',
            canManuallyAdvance: true,
            onEnter(ctx) {
              const card =
                ctx.game.playerSystem.player1.boardSide.leftBattlefield
                  .spaces[1].card!;
              ctx.client.ui.highlightedElement =
                ctx.client.ui.DOMSelectors.cardHp(card.id).element;
            }
          },
          {
            text: "This time, your minion didn't suffer any damage because it attacked an exhausted enemy.",
            right: '13%',
            bottom: '40%',
            canManuallyAdvance: true,
            onEnter(ctx) {
              ctx.client.ui.highlightedElement = null;
            }
          },
          {
            text: 'But keep in mind that a ready minion will strike back!',
            right: '13%',
            bottom: '40%',
            canManuallyAdvance: true,
            onEnter(ctx) {
              ctx.client.ui.highlightedElement = null;
            }
          }
        ]
      }
    ]
  }
};
