import type { MinionCard } from '@game/engine/src/card/entities/minion.entity';
import type { TutorialMission } from '.';
import { makeTutorialDeck } from './utils';
import { isDefined, waitFor } from '@game/shared';
import { CARD_LOCATIONS } from '@game/engine/src/card/card.enums';
import { GAME_EVENTS } from '@game/engine/src/game/game.events';
import { GAME_PHASES } from '@game/engine/src/game/game.enums';
import { match } from 'ts-pattern';

export const basicsTutorial: TutorialMission = {
  id: 'basics',
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
          CARDS_DRAWN_PER_TURN: 1,
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
              reason: 'Move your minion to the specified space'
            };
          }
          if (
            input.payload.zone !== CARD_LOCATIONS.LEFT_BATTLEFIELD ||
            input.payload.index !== 1
          ) {
            return {
              isValid: false,
              reason: 'Move your minion to the designated space'
            };
          }
          return {
            isValid: true
          };
        },
        textBoxes: [
          {
            text: 'The Bloodbound invaders are trying to take over our outpost !',
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: true
          },
          {
            text: 'Use your minions to defend our position !',
            right: '22%',
            bottom: '45%',
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
            right: '22%',
            bottom: '45%',
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
            text: 'You need to <b>SCORE</b> to strengthen your position !',
            right: '22%',
            bottom: '45%',
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
            right: '22%',
            bottom: '45%',
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
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: true,
            onEnter(ctx) {
              const card =
                ctx.game.playerSystem.player1.boardSide.leftBattlefield
                  .spaces[1].card!;
              ctx.client.ui.highlightedElement =
                ctx.client.ui.DOMSelectors.cardCommandment(card.id).element;
            }
          },
          {
            text: 'At the end of the turn, the player with the most Influence gains 1 <b>VICTORY POINT</b>',
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: true,
            onEnter(ctx) {
              ctx.client.ui.highlightedElement = null;
            }
          },
          {
            text: 'Fill up your Victory Points gauge to win the game !',
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
            text: 'The enemy scored as well ! You are now tied in influence.',
            left: '50%',
            top: '25%',
            hideDuringOpponentInitiative: true,
            canManuallyAdvance: true,
            async onEnter(ctx) {
              ctx.client.ui.highlightedElement = null;
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
            text: 'After Scoring, a minion is <b>EXHAUSTED</b> and cannot act anymore this turn.',
            left: '50%',
            top: '25%',
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
            if (input.type === 'selectSpaceOnBoard') {
              if (
                input.payload.id !==
                ctx.game.playerSystem.player1.boardSide.base[2].id
              ) {
                return {
                  isValid: false,
                  reason: 'Drag your minion on the highlighted space.'
                };
              }
            }
          }
          return {
            isValid: true
          };
        },
        textBoxes: [
          {
            text: 'If the enemy passes as well, the turn will end.',
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: true
          },
          {
            text: 'At the start of each turn, influence on the battlefield resets.',
            right: '22%',
            bottom: '45%',
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
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: true,
            onEnter(ctx) {
              ctx.client.ui.highlightedElement = null;
            }
          },

          {
            text: "You got some reinforcements ! Let's use them to turn the tides of battle !",
            right: '22%',
            bottom: '45%',
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
            right: '22%',
            bottom: '45%',
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
          return isDefined(
            ctx.game.playerSystem.player1.boardSide.leftBattlefield.spaces[0]
              .card
          );
        },
        validateInput(input, ctx) {
          if (input.type !== 'move') {
            return {
              isValid: false,
              reason: 'Move your minion to the specified space'
            };
          }
          if (
            input.payload.zone !== CARD_LOCATIONS.LEFT_BATTLEFIELD ||
            input.payload.index !== 0 ||
            input.payload.cardId !==
              ctx.game.playerSystem.player1.boardSide.base[2].card!.id
          ) {
            return {
              isValid: false,
              reason: 'Move your minion to the designated space'
            };
          }
          return {
            isValid: true
          };
        },
        textBoxes: [
          {
            text: 'Minions are played in your <b>Base</b>.',
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: true
          },
          {
            text: 'Your opponent played a minion of their own.',
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: true,
            hideDuringOpponentInitiative: true,
            async onEnter(ctx) {
              await waitFor(500);
              ctx.game.dispatch({
                type: 'declarePlayCard',
                payload: {
                  playerId: ctx.game.playerSystem.player2.id,
                  id: ctx.game.playerSystem.player2.cardManager.hand[0].id
                }
              });
              await waitFor(500);
              ctx.game.dispatch({
                type: 'selectSpaceOnBoard',
                payload: {
                  playerId: ctx.game.playerSystem.player2.id,
                  id: ctx.game.playerSystem.player2.boardSide.base[2].id
                }
              });
            }
          },
          {
            text: 'Move your new minion to prepare for the assault.',
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: false,
            advanceCondition() {
              return false;
            },
            gesture: {
              from: ctx =>
                ctx.client.ui.DOMSelectors.boardSpace('p1-base-2').element!,
              to: ctx =>
                ctx.client.ui.DOMSelectors.boardSpace('p1-left_battlefield-0')
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
        solveCondition(ctx) {
          return !!ctx.game.playerSystem.player1.boardSide.leftBattlefield
            .spaces[1].card?.isExhausted;
        },
        validateInput(input, ctx) {
          if (input.type !== 'declareAttack') {
            return {
              isValid: false,
              reason: 'Declare an attack on the enemy Bloodbound Invader.'
            };
          }
          if (
            input.payload.attackerId !==
            ctx.game.playerSystem.player1.boardSide.leftBattlefield.spaces[1]
              .card!.id
          ) {
            return {
              isValid: false,
              reason: 'You must declare an attack with the correct minion.'
            };
          }
          return {
            isValid: true
          };
        },
        textBoxes: [
          {
            text: 'Moving does not exhaust your minion. However, a minion can only move once per turn.',
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: true
          },
          {
            text: 'Your opponent chose to score again. Time to take advantage of this !',
            right: '22%',
            bottom: '45%',
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
            right: '22%',
            bottom: '45%',
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
        id: 6,
        canRetry: () => false,
        failedCondition: () => false,
        meta: {},
        async setup() {},
        teardown() {},
        solveCondition(ctx) {
          return !isDefined(
            ctx.game.playerSystem.player2.boardSide.leftBattlefield.spaces[1]
              .card
          );
        },
        validateInput(input, ctx) {
          if (input.type !== 'declareAttack') {
            return {
              isValid: false,
              reason: 'Declare an attack on the enemy Bloodbound Invader.'
            };
          }
          if (
            input.payload.attackerId !==
            ctx.game.playerSystem.player1.boardSide.leftBattlefield.spaces[0]
              .card!.id
          ) {
            return {
              isValid: false,
              reason: 'You must declare an attack with the correct minion.'
            };
          }
          return {
            isValid: true
          };
        },
        textBoxes: [
          {
            text: 'When a minion attacks, it deals damage to the enemy equal to its attack.',
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: true,
            async onEnter(ctx) {
              await waitFor(2000);
              const card =
                ctx.game.playerSystem.player1.boardSide.leftBattlefield
                  .spaces[1].card!;
              ctx.client.ui.highlightedElement =
                ctx.client.ui.DOMSelectors.cardAttack(card.id).element;
            }
          },
          {
            text: 'When a minion has taken more damage than its health, it is destroyed.',
            right: '22%',
            bottom: '45%',
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
            text: 'Note that attacking, like scoring, exhausts the attacker.',
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: true,
            onEnter(ctx) {
              ctx.client.ui.highlightedElement = null;
            }
          },
          {
            text: "The opponent moved another minion on the battlefield. Let's attack it with our second minion.",
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: false,
            advanceCondition() {
              return false;
            },
            async onEnter(ctx) {
              await waitFor(500);
              const enemyMinion = ctx.game.playerSystem.player2.boardSide
                .base[2].card as MinionCard;
              await enemyMinion.moveManually(
                CARD_LOCATIONS.LEFT_BATTLEFIELD,
                1
              );
              await ctx.game.snapshotSystem.takeSnapshot();
            },
            gesture: {
              from: ctx =>
                ctx.client.ui.DOMSelectors.boardSpace('p1-left_battlefield-0')
                  .element!,
              to: ctx =>
                ctx.client.ui.DOMSelectors.boardSpace('p2-left_battlefield-1')
                  .element!
            }
          }
        ]
      },
      {
        id: 7,
        canRetry: () => false,
        meta: {},
        async setup() {},
        teardown() {},
        solveCondition(ctx) {
          return (
            ctx.game.playerSystem.player1.boardSide.leftBattlefield
              .commandmentScore === 3
          );
        },
        failedCondition: ctx => {
          const minions = ctx.game.playerSystem.player1.minions;
          if (minions.length < 3) return false;

          return (
            minions.every(m => m.isExhausted) &&
            ctx.game.playerSystem.player1.boardSide.leftBattlefield
              .commandmentScore !== 3
          );
        },
        validateInput(input) {
          if (input.type === 'pass') {
            return {
              isValid: false,
              reason:
                'Try to score with your Silverguard Knight before passing.'
            };
          }
          return {
            isValid: true
          };
        },
        textBoxes: [
          {
            text: 'Your minion took some damage this time.',
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: true,
            async onEnter(ctx) {
              await waitFor(2000);
              const card =
                ctx.game.playerSystem.player1.boardSide.leftBattlefield
                  .spaces[0].card!;
              ctx.client.ui.highlightedElement =
                ctx.client.ui.DOMSelectors.cardHp(card.id).element;
            }
          },
          {
            text: 'This is because the enemy was <b>READY</b>. Ready minions strike back, keep that in mind !',
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: true
          },
          {
            text: 'You managed to deal with the enemy forces, but your opponent is ahead in influence.',
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: true,
            onEnter(ctx) {
              ctx.client.ui.highlightedElement = null;
            }
          },
          {
            text: 'Here are another card in your hand. Thankfully it has an influence of 3 !',
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: true,
            async onEnter(ctx) {
              const card = await ctx.game.playerSystem.player1.generateCard(
                'tutorial-silverguard-knight',
                false
              );
              await card.addToHand();
              await ctx.game.snapshotSystem.takeSnapshot();
              await ctx.game.dispatch({
                type: 'pass',
                payload: { playerId: ctx.game.playerSystem.player2.id }
              });
            }
          },
          {
            text: 'Play it, move it to the battlefield and score with it get ahead in influence.',
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: false,
            advanceCondition() {
              return false;
            },
            async onEnter(ctx) {
              const unsub = ctx.game.on(
                GAME_EVENTS.TURN_INITATIVE_CHANGE,
                async event => {
                  if (
                    event.data.newInitiativePlayer ===
                    ctx.game.playerSystem.player2
                  ) {
                    await waitFor(300);
                    ctx.game.dispatch({
                      type: 'pass',
                      payload: { playerId: ctx.game.playerSystem.player2.id }
                    });
                  }
                }
              );
              ctx.game.once(GAME_EVENTS.TURN_START, unsub);
            }
          }
        ]
      },
      {
        id: 8,
        canRetry: () => false,
        meta: {},
        async setup() {},
        teardown() {},
        solveCondition(ctx) {
          return (
            ctx.game.turnSystem.elapsedTurns === 2 &&
            ctx.game.gamePhaseSystem.getState() === GAME_PHASES.MAIN
          );
        },
        failedCondition() {
          return false;
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
            text: 'Good job ! You now have more influence than your opponent, the turn is secure.',
            left: '0%',
            bottom: '35%',
            canManuallyAdvance: true
          },
          {
            text: 'You can pass priority to end the turn and gain a Victory Point now.',
            left: '0%',
            bottom: '35%',
            canManuallyAdvance: false,
            advanceCondition() {
              return false;
            }
          }
        ]
      },
      {
        id: 9,
        canRetry: () => false,
        meta: {},
        async setup() {},
        teardown() {},
        solveCondition() {
          return false;
        },
        failedCondition() {
          return false;
        },
        validateInput() {
          return {
            isValid: true
          };
        },
        textBoxes: [
          {
            text: 'You are only one point away from victory !',
            left: '0%',
            bottom: '35%',
            canManuallyAdvance: true,
            onEnter(ctx) {
              ctx.client.ui.highlightedElement =
                ctx.client.ui.DOMSelectors.victoryPoints(
                  ctx.game.playerSystem.player1.id
                ).element!;
            }
          },
          {
            text: 'Let`s try to win this turn.',
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: true,
            async onEnter(ctx) {
              ctx.client.ui.highlightedElement = null;
              const p1 = ctx.game.playerSystem.player1;
              // setup opponent hand
              const p2 = ctx.game.playerSystem.player2;

              const executor = await p2.generateCard<MinionCard>(
                'bloodbound-executor',
                false
              );
              const shaman = await p2.generateCard<MinionCard>(
                'bloodbound-shaman',
                false
              );
              await executor.playImmediatelyAt(p2.boardSide.base[0], {
                shouldExhaust: false
              });
              await shaman.playImmediatelyAt(p2.boardSide.base[1], {
                shouldExhaust: false
              });

              // setup player hand
              const silverGuardKnight = await p1.generateCard(
                'tutorial-silverguard-knight',
                false
              );

              await silverGuardKnight.addToHand();

              await ctx.game.snapshotSystem.takeSnapshot();
            }
          },
          {
            text: 'You need one more Victory Point. Gain more influence than the enemy, then end the turn. Choose which minions will fight and which will score.',
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: true
          },
          {
            text: "You're on your own now! Repel the Bloodbound invaders !",
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: false,
            advanceCondition() {
              return false;
            },
            async onEnter(ctx) {
              const p1 = ctx.game.playerSystem.player1;
              const p2 = ctx.game.playerSystem.player2;
              ctx.client.onUpdateCompleted(async () => {
                const shouldPlay = ctx.game.activePlayers
                  .map(p => p.id)
                  .includes(p2.id);
                if (!shouldPlay) {
                  return;
                }
                await waitFor(500);
                match(ctx.game.interaction.getContext())
                  // AI is playing a card, just pick whatever empty base slot available
                  .with({ state: 'select_space_on_board' }, async () => {
                    await waitFor(1000);
                    const emptySpace = p2.boardSide.base.find(
                      space => space.isEmpty
                    )!;
                    console.log('AI dispatch selectSpaceOnBoard');
                    return ctx.game.dispatch({
                      type: 'selectSpaceOnBoard',
                      payload: {
                        playerId: p2.id,
                        id: emptySpace.id
                      }
                    });
                  })
                  .with({ state: 'idle' }, () => {
                    // first play all cards in hand. This gives the player clear information of what they are facing
                    if (p2.cardManager.hand.length > 0) {
                      const card = p2.cardManager.hand[0];
                      console.log('AI dispatch declarePlayCard', card.id);
                      return ctx.game.dispatch({
                        type: 'declarePlayCard',
                        payload: {
                          playerId: p2.id,
                          id: card.id
                        }
                      });
                    }
                    // then move all minions to the battlefield
                    const [minionInBase] = p2.boardSide.base
                      .map(space => space.card)
                      .filter(isDefined);
                    if (minionInBase) {
                      const emptySpace =
                        p2.boardSide.leftBattlefield.spaces.find(
                          space => space.isEmpty
                        );
                      if (emptySpace) {
                        console.log('AI dispatch move', minionInBase.id);
                        return ctx.game.dispatch({
                          type: 'move',
                          payload: {
                            playerId: p2.id,
                            cardId: minionInBase.id,
                            index: emptySpace.index,
                            zone: emptySpace.position.zone
                          }
                        });
                      }
                    }
                    const availableMinionsInBatlefield =
                      p2.boardSide.leftBattlefield.spaces
                        .map(space => space.card)
                        .filter(isDefined)
                        .filter(minion => !minion.isExhausted);

                    const executor = availableMinionsInBatlefield.find(
                      minion => minion.blueprintId === 'bloodbound-executor'
                    ) as MinionCard;
                    if (executor) {
                      /*
                      executor always attacks:
                      - prioritizing a minion it can kill
                      - exhausted minions
                      */
                      const availableTargets =
                        p1.boardSide.leftBattlefield.spaces
                          .map(space => space.card)
                          .filter(isDefined) as MinionCard[];
                      const attackTarget = availableTargets.sort((a, b) => {
                        const canKillA = a.remainingHp <= executor.atk;
                        const canKillB = b.remainingHp <= executor.atk;
                        if (canKillA && !canKillB) return -1;
                        if (!canKillA && canKillB) return 1;
                        if (a.isExhausted && !b.isExhausted) return -1;
                        if (!a.isExhausted && b.isExhausted) return 1;
                        return 0;
                      })[0];
                      if (attackTarget) {
                        console.log(
                          'AI dispatch declareAttack',
                          executor.id,
                          attackTarget.id
                        );
                        return ctx.game.dispatch({
                          type: 'declareAttack',
                          payload: {
                            playerId: p2.id,
                            attackerId: executor.id,
                            targetId: attackTarget.id
                          }
                        });
                      }
                    }
                    const shaman = availableMinionsInBatlefield.find(
                      minion => minion.blueprintId === 'bloodbound-shaman'
                    ) as MinionCard;
                    if (shaman) {
                      // shaman always scores
                      console.log('AI dispatch score', shaman.id);
                      return ctx.game.dispatch({
                        type: 'score',
                        payload: {
                          playerId: p2.id,
                          minionId: shaman.id
                        }
                      });
                    }
                    const invader = availableMinionsInBatlefield.find(
                      minion => minion.blueprintId === 'bloodbound-invader'
                    ) as MinionCard;
                    if (invader) {
                      console.log('AI found invader', invader.id);
                      // invader always scores if AI has lower influence, otherwise attacks with same rules as executor
                      const isLosing = p2.boardSide.leftBattlefield.isLosing;
                      if (isLosing) {
                        console.log('AI dispatch score', invader.id);
                        return ctx.game.dispatch({
                          type: 'score',
                          payload: {
                            playerId: p2.id,
                            minionId: invader.id
                          }
                        });
                      } else {
                        const availableTargets =
                          p1.boardSide.leftBattlefield.spaces
                            .map(space => space.card)
                            .filter(isDefined) as MinionCard[];
                        const attackTarget = availableTargets.sort((a, b) => {
                          const canKillA = a.remainingHp <= invader.atk;
                          const canKillB = b.remainingHp <= invader.atk;
                          if (canKillA && !canKillB) return -1;
                          if (!canKillA && canKillB) return 1;
                          if (a.isExhausted && !b.isExhausted) return -1;
                          if (!a.isExhausted && b.isExhausted) return 1;
                          return 0;
                        })[0];
                        if (attackTarget) {
                          console.log(
                            'AI dispatch declareAttack',
                            invader.id,
                            attackTarget.id
                          );
                          return ctx.game.dispatch({
                            type: 'declareAttack',
                            payload: {
                              playerId: p2.id,
                              attackerId: invader.id,
                              targetId: attackTarget.id
                            }
                          });
                        }
                      }
                    }
                    console.log('AI dispatch pass');
                    return ctx.game.dispatch({
                      type: 'pass',
                      payload: {
                        playerId: p2.id
                      }
                    });
                  })
                  .otherwise(() => {
                    ctx.game.dispatch({
                      type: 'pass',
                      payload: {
                        playerId: p2.id
                      }
                    });
                  });
              });
            }
          }
        ]
      }
    ]
  }
};
