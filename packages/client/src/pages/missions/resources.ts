import type { TutorialMission } from '.';
import { makeTutorialDeck } from './utils';
import { waitFor } from '@game/shared';
import type { PlayerViewModel } from '@game/engine/src/client/view-models/player.model';
import {
  cardInHandElement,
  dispatchSequence,
  emptyBaseSpaceElement,
  findCardInHand,
  getCardViewModel,
  getEmptyBaseSpaces,
  goToNextStepOn,
  makeOpponentChooseAffinity,
  makeOpponentPassUntilNextTurn,
  minionSpaceElement,
  suggestedBattlefieldSpaceElement,
  validateMovingMinion,
  validatePlayingCard,
  validatePlayingSpell,
  validateSupplyCard,
  startFreePlay,
  isFreePlayFailed
} from '../../tutorial/tutorial-utils';
import { CARD_LOCATIONS } from '@game/engine/src/card/card.enums';
import type { MinionCard } from '@game/engine/src/card/entities/minion.entity';
import type { AnyCard } from '@game/engine/src/card/entities/card.entity';
import type { TutorialContext } from '@game/engine/src/tutorial/v2/tutorial';
import { GAME_EVENTS } from '@game/engine/src/game/game.events';
import {
  GAME_PHASES,
  INTERACTION_EVENTS,
  INTERACTION_STATES
} from '@game/engine/src/game/game.enums';

/**
 * Simple AI used for the last part of the mission. It only uses the minions on the board:
 * - minions in base are moved to the battlefield
 * - minions on the battlefield attack if they can destroy an enemy, otherwise they score
 * - when nothing else can be done, it passes
 */
const startOpponentAI = (ctx: TutorialContext) => {
  const p1 = ctx.game.playerSystem.player1;
  const p2 = ctx.game.playerSystem.player2;

  const chooseAffinity = () => {
    const { ctx: interactionCtx } =
      ctx.game.interaction.getContext<'choosing_cards'>();
    const isWaitingForOpponent = interactionCtx
      .serialize()
      .players.includes(p2.id);
    if (!isWaitingForOpponent) return;

    return ctx.game.dispatch({
      type: 'chooseCards',
      payload: { playerId: p2.id, indices: [0] }
    });
  };

  const takeTurnAction = () => {
    const minionToMove = p2.minionsInBase.find(
      minion => minion.canMoveManually
    );
    const emptySpace = p2.boardSide.leftBattlefield.spaces.find(
      space => space.isEmpty
    );
    if (minionToMove && emptySpace) {
      return ctx.game.dispatch({
        type: 'move',
        payload: {
          playerId: p2.id,
          cardId: minionToMove.id,
          zone: CARD_LOCATIONS.LEFT_BATTLEFIELD,
          index: emptySpace.index
        }
      });
    }

    const readyMinions = p2.minionsInLeftBattlefield.filter(
      minion => !minion.isExhausted
    );
    for (const minion of readyMinions) {
      const target = p1.minionsInLeftBattlefield
        .filter(enemy => minion.canAttack(enemy))
        .filter(enemy => enemy.remainingHp <= minion.atk)
        // prefer exhausted targets as they cannot strike back
        .sort((a, b) => Number(b.isExhausted) - Number(a.isExhausted))[0];

      if (target) {
        return ctx.game.dispatch({
          type: 'declareAttack',
          payload: {
            playerId: p2.id,
            attackerId: minion.id,
            targetId: target.id
          }
        });
      }

      if (minion.canScore) {
        return ctx.game.dispatch({
          type: 'score',
          payload: { playerId: p2.id, minionId: minion.id }
        });
      }
    }

    return ctx.game.dispatch({ type: 'pass', payload: { playerId: p2.id } });
  };

  const act = () => {
    const interactionState = ctx.game.interaction.getState();
    if (interactionState === INTERACTION_STATES.CHOOSING_CARDS) {
      return chooseAffinity();
    }

    const isOpponentTurn =
      ctx.game.gamePhaseSystem.getState() === GAME_PHASES.MAIN &&
      interactionState === INTERACTION_STATES.IDLE &&
      !ctx.game.effectChainSystem.currentChain &&
      ctx.game.turnSystem.initiativePlayer.equals(p2);
    if (!isOpponentTurn) return;

    return takeTurnAction();
  };

  let isThinking = false;
  const run = async () => {
    if (ctx.game.gamePhaseSystem.getState() === GAME_PHASES.GAME_END) {
      stop();
      return;
    }
    // several snapshots can be received for a single input
    // make sure we only take one decision at a time
    if (isThinking) return;
    isThinking = true;
    try {
      await waitFor(700);
      act();
    } finally {
      isThinking = false;
    }
  };

  const stop = ctx.client.onUpdateCompleted(run);
  void run();
};

export const resourcesTutorial: TutorialMission = {
  id: 'resources',
  name: 'Mission 2: Mana & Affinities',
  nextMission: 'artifacts-secrets',
  options: {
    gameOptions: {
      players: [
        {
          id: 'p1',
          name: 'You',
          deck: {
            cards: makeTutorialDeck([
              // turn 1 hand
              ['tutorial-windblade-adept', 1],
              ['tutorial-silverguard-knight', 1],
              ['tutorial-windblade-adept', 1],
              ['tutorial-suntide-maiden', 1],
              // turn 2 draws
              ['tutorial-true-strike', 1],
              ['tutorial-silverguard-knight', 1],
              ['tutorial-lionheart-blessing', 1],
              ['tutorial-windblade-adept', 10],
              ['tutorial-silverguard-outpost', 1],
              ['light-affinity', 10]
            ])
          }
        },
        {
          id: 'p2',
          name: 'Opponent',
          deck: {
            cards: makeTutorialDeck([
              // turn 1 hand
              ['bloodbound-invader', 2],
              ['bloodbound-executor', 1],
              ['bloodbound-invader', 1],
              // turn 2 draws
              ['bloodbound-shaman', 1],
              ['bloodbound-executor', 1],
              ['bloodbound-invader', 10],
              ['tutorial-silverguard-outpost', 1],
              ['fire-affinity', 10]
            ])
          }
        }
      ],
      rngSeed: 'tutorial-seed',
      history: [],
      overrides: {
        config: {
          SHOULD_ROTATE_LOCATIONS: false,
          SHUFFLE_DECK_ON_GAME_START: false,
          CARDS_DRAWN_PER_TURN: 5,
          CARDS_MULLIGANED_PER_TURN: 0,
          INITIAL_HAND_SIZE: 0,
          PLAYER_1_CARDS_DRAWN_ON_FIRST_TURN: 4,
          PLAYER_2_CARDS_DRAWN_ON_FIRST_TURN: 4,
          START_OF_GAME_MULLIGANED_CARDS: 0,
          VICTORY_POINTS_TO_WIN: 2
        }
      }
    },
    boardType: 'single',
    meta: {},
    steps: [
      {
        id: 0,
        canRetry: () => false,
        failedCondition: () => false,
        meta: {},
        async setup(ctx) {
          ctx.client.ui.displayedElements.battleLog = false;
          ctx.client.ui.displayedElements.affinities = false;

          // auto select affinity for both players
          const interactionCtx =
            ctx.game.interaction.getContext<'choosing_cards'>();
          interactionCtx.ctx.commit(ctx.game.playerSystem.player1, [0]);
          interactionCtx.ctx.commit(ctx.game.playerSystem.player2, [0]);
        },
        teardown() {},
        solveCondition(ctx) {
          return ctx.game.playerSystem.player1.cardManager.supply.size === 1;
        },
        validateInput(input, ctx) {
          const card = ctx.game.playerSystem.player1.cardManager.hand[0];
          return validateSupplyCard(card, input, ctx);
        },
        textBoxes: [
          {
            // no onEnter: the first box of the mission is entered before the client has a state to highlight things from
            text: 'The Bloodbound clan is back! We must establish a strong defense.',
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: true
          },
          {
            text: 'This time, your cards cost <b>Mana</b> to play.',
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: true,
            async onEnter(ctx) {
              const p1Id = ctx.client.state.players[0];
              const p1 = ctx.client.state.entities[p1Id] as PlayerViewModel;
              const card = p1.hand[0];
              ctx.client.ui.highlightedCard = card;
              await waitFor(100);
              ctx.client.ui.highlightedElement =
                ctx.client.ui.DOMSelectors.highlightedCardMana().element;
            }
          },
          {
            text: 'To get mana, you <b>SUPPLY</b> cards instead of playing them. This is how much mana a card gives.',
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: true,
            async onEnter(ctx) {
              ctx.client.ui.highlightedElement =
                ctx.client.ui.DOMSelectors.highlightedCardSupply().element;
            }
          },
          {
            text: "Drag your Windblade Adept to the <b>Supply Zone</b>. Don't worry, supplied cards come back to your hand next turn!",
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: false,
            advanceCondition() {
              return false;
            },
            onEnter(ctx) {
              ctx.client.ui.highlightedCard = null;
              ctx.client.ui.highlightedElement = null;
            },
            gesture: {
              from(ctx) {
                const card = ctx.game.playerSystem.player1.cardManager.hand[0];
                return ctx.client.ui.DOMSelectors.cardInHand(
                  card.id,
                  ctx.game.playerSystem.player1.id
                ).element;
              },
              to(ctx) {
                return ctx.client.ui.DOMSelectors.supplyZone(
                  ctx.game.playerSystem.player1.id
                ).element;
              }
            }
          }
        ]
      },
      {
        id: 1,
        canRetry: () => false,
        failedCondition: () => false,
        meta: {},
        async setup(ctx) {
          // the player can play it on any base space, so later steps find it here rather than by position
          ctx.meta.windbladeAdept = findCardInHand(
            ctx,
            'tutorial-windblade-adept'
          );
        },
        teardown() {},
        solveCondition(ctx) {
          return (
            (ctx.meta.windbladeAdept as AnyCard).location ===
            CARD_LOCATIONS.BASE
          );
        },
        validateInput(input, ctx) {
          return validatePlayingCard(
            ctx.meta.windbladeAdept,
            input,
            ctx,
            getEmptyBaseSpaces(ctx)
          );
        },
        textBoxes: [
          {
            text: 'This is your mana: the Windblade Adept gave you 2.',
            left: '10%',
            bottom: '35%',
            canManuallyAdvance: true,
            onEnter(ctx) {
              ctx.client.ui.highlightedElement =
                ctx.client.ui.DOMSelectors.currentMana(
                  ctx.game.playerSystem.player1.id
                ).element;
            }
          },
          {
            text: "Supplying doesn't pass the initiative, so you can play your other Windblade Adept right away.",
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: false,
            advanceCondition: () => false,
            onEnter(ctx) {
              ctx.client.ui.highlightedElement = null;
            },
            gesture: {
              from: ctx => cardInHandElement(ctx, ctx.meta.windbladeAdept),
              to: emptyBaseSpaceElement
            }
          }
        ]
      },
      {
        id: 2,
        canRetry: () => false,
        failedCondition: () => false,
        meta: {},
        async setup(ctx) {
          ctx.meta.silverGuardKnight =
            ctx.game.playerSystem.player1.cardManager.hand[0];
          ctx.meta.suntideMaiden =
            ctx.game.playerSystem.player1.cardManager.hand[1];
        },
        teardown() {},
        solveCondition(ctx) {
          return (
            ctx.meta.suntideMaiden.location === CARD_LOCATIONS.SUPPLY &&
            ctx.meta.silverGuardKnight.location === CARD_LOCATIONS.BASE
          );
        },
        validateInput(input, ctx) {
          const silverGuardKnight = ctx.meta.silverGuardKnight;
          const suntideMaiden = ctx.meta.suntideMaiden;
          if (suntideMaiden.location !== CARD_LOCATIONS.SUPPLY) {
            return validateSupplyCard(suntideMaiden, input, ctx);
          } else {
            return validatePlayingCard(
              silverGuardKnight,
              input,
              ctx,
              ctx.game.playerSystem.player1.boardSide.base.filter(
                space => space.isEmpty
              )
            );
          }
        },
        textBoxes: [
          {
            text: 'Your opponent put 2 cards in the Supply Zone and played a minion of their own.',
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: true,
            async onEnter(ctx) {
              const p2 = ctx.game.playerSystem.player2;

              dispatchSequence(ctx, [
                () => ({
                  type: 'declarePlayCard',
                  payload: {
                    id: p2.cardManager.hand[0].id,
                    playerId: p2.id
                  }
                }),
                () => ({
                  type: 'supplyCard',
                  payload: {
                    playerId: p2.id
                  }
                }),
                () => ({
                  type: 'declarePlayCard',
                  payload: {
                    id: p2.cardManager.hand[0].id,
                    playerId: p2.id
                  }
                }),
                () => ({
                  type: 'supplyCard',
                  payload: {
                    playerId: p2.id
                  }
                }),
                () => ({
                  type: 'declarePlayCard',
                  payload: {
                    id: p2.cardManager.hand[0].id,
                    playerId: p2.id
                  }
                }),
                () => ({
                  type: 'selectSpaceOnBoard',
                  payload: {
                    playerId: p2.id,
                    id: p2.boardSide.base[2].id
                  }
                })
              ]);
            }
          },
          {
            text: 'Your <b>Suntide Maiden</b> could deal with it, but she needs two Lyonar <b>Affinities</b> to be played.',
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: true,
            async onEnter(ctx) {
              ctx.client.ui.displayedElements.affinities = true;
              const p1Id = ctx.client.state.players[0];
              const p1 = ctx.client.state.entities[p1Id] as PlayerViewModel;
              const card = p1.hand[1];
              ctx.client.ui.highlightedCard = card;
              await waitFor(100);
              ctx.client.ui.highlightedElement =
                ctx.client.ui.DOMSelectors.highlightedCardAffinities().element;
            }
          },
          {
            text: 'You only have one Lyonar affinity for now.',
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: true,
            onEnter(ctx) {
              ctx.client.ui.highlightedElement =
                ctx.client.ui.DOMSelectors.runeZone(
                  ctx.game.playerSystem.player1.id
                ).element;
            }
          },
          {
            text: 'Supply the Suntide Maiden for now, then play the Silverguard Knight.',
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: false,
            advanceCondition: () => false,
            onEnter(ctx) {
              ctx.client.ui.highlightedCard = null;
              ctx.client.ui.highlightedElement = null;
            },
            gesture: {
              from(ctx) {
                const p1 = ctx.game.playerSystem.player1;
                const suntideMaiden = ctx.meta.suntideMaiden as AnyCard;
                const card =
                  suntideMaiden.location === CARD_LOCATIONS.HAND
                    ? suntideMaiden
                    : (ctx.meta.silverGuardKnight as AnyCard);
                if (card.location !== CARD_LOCATIONS.HAND) return null;
                return ctx.client.ui.DOMSelectors.cardInHand(card.id, p1.id)
                  .element;
              },
              to(ctx) {
                const p1 = ctx.game.playerSystem.player1;
                const suntideMaiden = ctx.meta.suntideMaiden as AnyCard;
                if (suntideMaiden.location === CARD_LOCATIONS.HAND) {
                  return ctx.client.ui.DOMSelectors.supplyZone(p1.id).element;
                }
                const emptySpace = p1.boardSide.base.find(
                  space => space.isEmpty
                );
                if (!emptySpace) return null;
                return ctx.client.ui.DOMSelectors.boardSpace(emptySpace.id)
                  .element;
              }
            }
          }
        ]
      },
      {
        id: 3,
        canRetry: () => false,
        meta: {},
        async setup() {},
        teardown() {},
        failedCondition: () => false,
        solveCondition(ctx) {
          return (ctx.meta.windbladeAdept as MinionCard).isOnBattlefield;
        },
        validateInput(input, ctx) {
          return validateMovingMinion(
            ctx.meta.windbladeAdept,
            input,
            ctx,
            CARD_LOCATIONS.LEFT_BATTLEFIELD
          );
        },
        textBoxes: [
          {
            text: 'The enemy played another minion. Move your Windblade Adept to the battlefield.',
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: false,
            advanceCondition() {
              return false;
            },
            hideDuringOpponentInitiative: true,
            async onEnter(ctx) {
              const p2 = ctx.game.playerSystem.player2;

              dispatchSequence(ctx, [
                () => ({
                  type: 'declarePlayCard',
                  payload: {
                    id: p2.cardManager.hand[0].id,
                    playerId: p2.id
                  }
                }),
                () => ({
                  type: 'selectSpaceOnBoard',
                  payload: {
                    playerId: p2.id,
                    id: p2.boardSide.base[4].id
                  }
                })
              ]);
            },
            gesture: {
              from: ctx => minionSpaceElement(ctx, ctx.meta.windbladeAdept),
              to: ctx =>
                suggestedBattlefieldSpaceElement(
                  ctx,
                  CARD_LOCATIONS.LEFT_BATTLEFIELD
                )
            }
          }
        ]
      },
      {
        id: 4,
        canRetry: () => false,
        failedCondition: () => false,
        meta: {},
        async setup(ctx) {
          ctx.meta.executor = ctx.game.playerSystem.player2.boardSide.base[2]
            .card as MinionCard;
        },
        teardown() {},
        solveCondition(ctx) {
          return (
            ctx.game.playerSystem.player1.boardSide.leftBattlefield
              .commandmentScore > 0
          );
        },
        validateInput(input, ctx) {
          const windbladeAdept = ctx.meta.windbladeAdept as MinionCard;
          if (
            input.type !== 'score' ||
            input.payload.minionId !== windbladeAdept.id
          ) {
            return {
              isValid: false,
              reason: 'Score with your Windblade Adept.'
            };
          }
          return { isValid: true };
        },
        textBoxes: [
          {
            text: 'The Bloodbound Executor is joining the fight! Score with your Windblade Adept: moving, attacking and scoring never cost mana.',
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: false,
            advanceCondition: () => false,
            hideDuringOpponentInitiative: true,
            onEnter(ctx) {
              const p2 = ctx.game.playerSystem.player2;
              dispatchSequence(ctx, [
                () => ({
                  type: 'move',
                  payload: {
                    playerId: p2.id,
                    cardId: (ctx.meta.executor as MinionCard).id,
                    zone: CARD_LOCATIONS.LEFT_BATTLEFIELD,
                    index: 1
                  }
                })
              ]);
            },
            gesture: {
              from: ctx => minionSpaceElement(ctx, ctx.meta.windbladeAdept),
              to(ctx) {
                const locationCard =
                  ctx.game.playerSystem.player1.boardSide.leftBattlefield
                    .locationCard;
                if (!locationCard) return null;
                return ctx.client.ui.DOMSelectors.cardOnBoard(locationCard.id)
                  .element;
              }
            }
          }
        ]
      },
      {
        id: 5,
        canRetry: () => false,
        failedCondition: () => false,
        meta: {},
        async setup(ctx) {
          // the opponent passes right after you, which ends the turn
          makeOpponentPassUntilNextTurn(ctx);
          makeOpponentChooseAffinity(ctx);
          // the next step explains the affinity choice while it is on screen
          goToNextStepOn(ctx, callback =>
            ctx.game.on(
              INTERACTION_EVENTS.INTERACTION_AFTER_CHANGE_STATE,
              event => {
                if (event.data.to.state === INTERACTION_STATES.CHOOSING_CARDS) {
                  callback();
                }
              }
            )
          );
        },
        teardown() {},
        solveCondition: () => false,
        validateInput(input) {
          // the player can pick an affinity before the opponent does, which skips straight to the next step
          if (input.type === 'pass' || input.type === 'chooseCards') {
            return { isValid: true };
          }
          return {
            isValid: false,
            reason: 'Pass to end the turn.'
          };
        },
        textBoxes: [
          {
            text: 'Ouch! The Executor destroyed your exhausted Windblade Adept. But the influence a minion scores stays on the battlefield even if it is destroyed, so you are still ahead.',
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: true,
            hideDuringOpponentInitiative: true,
            onEnter(ctx) {
              const p2 = ctx.game.playerSystem.player2;
              dispatchSequence(ctx, [
                () => ({
                  type: 'declareAttack',
                  payload: {
                    playerId: p2.id,
                    attackerId: (ctx.meta.executor as MinionCard).id,
                    targetId: (ctx.meta.windbladeAdept as MinionCard).id
                  }
                })
              ]);
            }
          },
          {
            text: "You are out of mana, so let's <b>PASS</b> to end the turn.",
            left: '0%',
            bottom: '35%',
            canManuallyAdvance: false,
            advanceCondition: () => false,
            // hides it once the turn ends, so it does not show over the affinity choice
            hideDuringOpponentInitiative: true,
            onEnter(ctx) {
              ctx.client.ui.highlightedElement =
                ctx.client.ui.DOMSelectors.passButton.element;
            }
          }
        ]
      },
      {
        id: 6,
        canRetry: () => false,
        failedCondition: () => false,
        meta: {},
        async setup(ctx) {
          ctx.client.ui.highlightedElement = null;
        },
        teardown() {},
        solveCondition(ctx) {
          return (
            ctx.game.turnSystem.elapsedTurns === 1 &&
            ctx.game.gamePhaseSystem.getState() === GAME_PHASES.MAIN
          );
        },
        validateInput(input) {
          if (input.type === 'chooseCards') {
            return { isValid: true };
          }
          return {
            isValid: false,
            reason: 'Choose an affinity.'
          };
        },
        textBoxes: [
          {
            text: 'Each turn, you pick a new <b>Affinity</b> to add to your Affinity Zone. Mixing affinities lets you play cards from several factions, but for now they are all Lyonar: pick either one.',
            left: '15%',
            bottom: '35%',
            canManuallyAdvance: false,
            advanceCondition: () => false
          }
        ]
      },
      {
        id: 7,
        canRetry: () => false,
        failedCondition: () => false,
        meta: {},
        async setup(ctx) {
          ctx.meta.suppliedAdept = findCardInHand(
            ctx,
            'tutorial-windblade-adept'
          );
          ctx.meta.secondKnight = findCardInHand(
            ctx,
            'tutorial-silverguard-knight'
          );
          ctx.meta.trueStrike = findCardInHand(ctx, 'tutorial-true-strike');
          ctx.meta.invader = ctx.game.playerSystem.player2.boardSide.base[4]
            .card as MinionCard;
        },
        teardown() {},
        solveCondition(ctx) {
          return (
            (ctx.meta.suppliedAdept as AnyCard).location ===
            CARD_LOCATIONS.SUPPLY
          );
        },
        validateInput(input, ctx) {
          return validateSupplyCard(ctx.meta.suppliedAdept, input, ctx);
        },
        textBoxes: [
          {
            text: 'A new turn begins! You won the last turn and gained a <b>Victory Point</b>.',
            left: '-5%',
            bottom: '25%',
            canManuallyAdvance: true,
            hideDuringOpponentInitiative: true,
            onEnter(ctx) {
              ctx.client.ui.highlightedElement =
                ctx.client.ui.DOMSelectors.victoryPoints(
                  ctx.game.playerSystem.player1.id
                ).element;
              const p2 = ctx.game.playerSystem.player2;
              ctx.game.dispatch({
                type: 'move',
                payload: {
                  playerId: p2.id,
                  cardId: (ctx.meta.invader as MinionCard).id,
                  zone: CARD_LOCATIONS.LEFT_BATTLEFIELD,
                  index: 0
                }
              });
            }
          },
          {
            text: "Your supplied cards came back to your hand, but mana doesn't carry over between turns.",
            left: '10%',
            bottom: '35%',
            canManuallyAdvance: true,
            onEnter(ctx) {
              ctx.client.ui.highlightedElement =
                ctx.client.ui.DOMSelectors.currentMana(
                  ctx.game.playerSystem.player1.id
                ).element;
            }
          },
          {
            text: 'You drew a <b>Spell</b>: True Strike! Spells have an immediate effect, and this one can destroy the Executor.',
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: true,
            onEnter(ctx) {
              ctx.client.ui.highlightedElement = null;
              ctx.client.ui.highlightedCard = getCardViewModel(
                ctx,
                ctx.meta.trueStrike
              );
            }
          },
          {
            text: 'Supply your Windblade Adept to get mana for it.',
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: false,
            advanceCondition: () => false,
            onEnter(ctx) {
              ctx.client.ui.highlightedCard = null;
              ctx.client.ui.highlightedElement = null;
            },
            gesture: {
              from(ctx) {
                const card = ctx.meta.suppliedAdept as AnyCard;
                if (card.location !== CARD_LOCATIONS.HAND) return null;
                return ctx.client.ui.DOMSelectors.cardInHand(
                  card.id,
                  ctx.game.playerSystem.player1.id
                ).element;
              },
              to(ctx) {
                return ctx.client.ui.DOMSelectors.supplyZone(
                  ctx.game.playerSystem.player1.id
                ).element;
              }
            }
          }
        ]
      },
      {
        id: 8,
        canRetry: () => false,
        failedCondition: () => false,
        meta: {},
        async setup() {},
        teardown() {},
        solveCondition(ctx) {
          return !(ctx.meta.executor as MinionCard).isOnBoard;
        },
        validateInput(input, ctx) {
          return validatePlayingSpell(ctx.meta.trueStrike, input, ctx, [
            ctx.meta.executor
          ]);
        },
        textBoxes: [
          {
            text: 'You now have enough mana. Drag True Strike onto the Bloodbound Executor to cast it!',
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: false,
            advanceCondition: () => false,
            gesture: {
              from(ctx) {
                const card = ctx.meta.trueStrike as AnyCard;
                if (card.location !== CARD_LOCATIONS.HAND) return null;
                return ctx.client.ui.DOMSelectors.cardInHand(
                  card.id,
                  ctx.game.playerSystem.player1.id
                ).element;
              },
              to(ctx) {
                return ctx.client.ui.DOMSelectors.cardOnBoard(
                  (ctx.meta.executor as MinionCard).id
                ).element;
              }
            }
          }
        ]
      },
      {
        id: 9,
        canRetry: () => false,
        failedCondition: () => false,
        meta: {},
        async setup() {},
        teardown() {},
        solveCondition(ctx) {
          return (
            (ctx.meta.secondKnight as AnyCard).location ===
              CARD_LOCATIONS.SUPPLY &&
            (ctx.meta.suntideMaiden as AnyCard).location === CARD_LOCATIONS.BASE
          );
        },
        validateInput(input, ctx) {
          if (
            (ctx.meta.secondKnight as AnyCard).location !==
            CARD_LOCATIONS.SUPPLY
          ) {
            return validateSupplyCard(ctx.meta.secondKnight, input, ctx);
          }
          return validatePlayingCard(
            ctx.meta.suntideMaiden,
            input,
            ctx,
            ctx.game.playerSystem.player1.boardSide.base.filter(
              space => space.isEmpty
            )
          );
        },
        textBoxes: [
          {
            text: 'The Executor is destroyed! Meanwhile, the enemy Invader scored.',
            left: '50%',
            top: '25%',
            canManuallyAdvance: true,
            hideDuringOpponentInitiative: true,
            onEnter(ctx) {
              const p2 = ctx.game.playerSystem.player2;
              // highlight the opponent influence once the Invader has scored
              ctx.game.once(GAME_EVENTS.INPUT_END, () => {
                ctx.client.ui.highlightedElement =
                  ctx.client.ui.DOMSelectors.influence(
                    p2.id,
                    CARD_LOCATIONS.LEFT_BATTLEFIELD
                  ).element;
              });
              dispatchSequence(ctx, [
                () => ({
                  type: 'score',
                  payload: {
                    playerId: p2.id,
                    minionId: (ctx.meta.invader as MinionCard).id
                  }
                })
              ]);
            }
          },
          {
            text: 'You now have two Lyonar affinities, so you can play the Suntide Maiden! She costs 3 mana: supply your Silverguard Knight, then play her.',
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: false,
            advanceCondition: () => false,
            onEnter(ctx) {
              ctx.client.ui.highlightedElement = null;
            },
            gesture: {
              from(ctx) {
                const p1 = ctx.game.playerSystem.player1;
                const knight = ctx.meta.secondKnight as AnyCard;
                const card =
                  knight.location === CARD_LOCATIONS.SUPPLY
                    ? (ctx.meta.suntideMaiden as AnyCard)
                    : knight;
                if (card.location !== CARD_LOCATIONS.HAND) return null;
                return ctx.client.ui.DOMSelectors.cardInHand(card.id, p1.id)
                  .element;
              },
              to(ctx) {
                const p1 = ctx.game.playerSystem.player1;
                const knight = ctx.meta.secondKnight as AnyCard;
                if (knight.location !== CARD_LOCATIONS.SUPPLY) {
                  return ctx.client.ui.DOMSelectors.supplyZone(p1.id).element;
                }
                const emptySpace = p1.boardSide.base.find(
                  space => space.isEmpty
                );
                if (!emptySpace) return null;
                return ctx.client.ui.DOMSelectors.boardSpace(emptySpace.id)
                  .element;
              }
            }
          }
        ]
      },
      {
        // the opponent summons a minion before the player is on their own
        // this is a separate step so the AI doesn't start until the scripted moves are done
        id: 10,
        canRetry: () => false,
        failedCondition: () => false,
        meta: {},
        async setup(ctx) {
          const p2 = ctx.game.playerSystem.player2;
          const findInOpponentHand = (blueprintId: string) =>
            p2.cardManager.hand.find(card => card.blueprintId === blueprintId)!;

          dispatchSequence(ctx, [
            () => ({
              type: 'declarePlayCard',
              payload: {
                playerId: p2.id,
                id: findInOpponentHand('bloodbound-invader').id
              }
            }),
            () => ({
              type: 'supplyCard',
              payload: { playerId: p2.id }
            }),
            () => ({
              type: 'declarePlayCard',
              payload: {
                playerId: p2.id,
                id: findInOpponentHand('bloodbound-shaman').id
              }
            }),
            () => ({
              type: 'selectSpaceOnBoard',
              payload: {
                playerId: p2.id,
                id: p2.boardSide.base[2].id
              }
            })
          ]);
        },
        teardown() {},
        solveCondition(ctx) {
          return ctx.game.playerSystem.player2.minions.some(
            minion => minion.blueprintId === 'bloodbound-shaman'
          );
        },
        validateInput() {
          return {
            isValid: false,
            reason: 'Wait for your opponent to make their move.'
          };
        },
        textBoxes: [
          {
            text: 'The enemy is calling for reinforcements...',
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: false,
            advanceCondition: () => false,
            hideDuringOpponentInitiative: true
          }
        ]
      },
      {
        id: 11,
        canRetry: () => false,
        failedCondition: isFreePlayFailed,
        meta: {},
        async setup(ctx) {
          startFreePlay(ctx);
          ctx.meta.shaman = ctx.game.playerSystem.player2.minions.find(
            minion => minion.blueprintId === 'bloodbound-shaman'
          );
          startOpponentAI(ctx);
        },
        teardown() {},
        solveCondition() {
          return false;
        },
        validateInput() {
          return { isValid: true };
        },
        textBoxes: [
          {
            text: 'The enemy summoned a <b>Bloodbound Shaman</b>, with 4 influence! If it scores, your opponent will have 6 influence.',
            left: '35%',
            top: '35%',
            canManuallyAdvance: true,
            async onEnter(ctx) {
              await waitFor(500);
              ctx.client.ui.highlightedElement =
                ctx.client.ui.DOMSelectors.cardCommandment(
                  (ctx.meta.shaman as MinionCard).id
                ).element;
            }
          },
          {
            // shown right away after a retry, so it holds the hint
            text: "You're on your own now! Win the battlefield to claim your second Victory Point. Your <b>Lionheart Blessing</b> gives a minion +2 influence: cast it before scoring!",
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: false,
            advanceCondition: () => false,
            onEnter(ctx) {
              ctx.client.ui.highlightedElement = null;
            }
          }
        ]
      }
    ]
  }
};
