import type { TutorialMission } from '.';
import { makeTutorialDeck } from './utils';
import { isDefined, waitFor } from '@game/shared';
import type { PlayerViewModel } from '@game/engine/src/client/view-models/player.model';
import {
  dispatchSequence,
  findCardInHand,
  getCardViewModel,
  makeOpponentChooseAffinity,
  makeOpponentPassUntilNextTurn,
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
          SHOULD_ROTATE_DESTINIES: false,
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
            text: 'The Bloodbound clan is back! We must establish a strong defense.',
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: true
          },
          {
            text: 'Cards cost <b>Mana</b> to play.',
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
            text: 'But they can also <b>SUPPLY</b> mana.',
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: true,
            async onEnter(ctx) {
              ctx.client.ui.highlightedElement =
                ctx.client.ui.DOMSelectors.highlightedCardSupply().element;
            }
          },
          {
            text: 'For a card to supply mana, you need to put it in the <b>Supply Zone</b>.',
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: true,
            onEnter(ctx) {
              ctx.client.ui.highlightedCard = null;
              ctx.client.ui.highlightedElement =
                ctx.client.ui.DOMSelectors.supplyZone(
                  ctx.game.playerSystem.player1.id
                ).element;
            }
          },
          {
            text: 'Drag the leftmost card in your hand to the Supply Zone.',
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: false,
            advanceCondition() {
              return false;
            },
            onEnter(ctx) {
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
        async setup() {},
        teardown() {},
        solveCondition(ctx) {
          return isDefined(
            ctx.game.playerSystem.player1.boardSide.base[2].card
          );
        },
        validateInput(input, ctx) {
          const card = ctx.game.playerSystem.player1.cardManager.hand[1];
          return validatePlayingCard(card, input, ctx, [
            ctx.game.playerSystem.player1.boardSide.base[2]
          ]);
        },
        textBoxes: [
          {
            text: 'This shows how much mana you currently have.',
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
            text: 'Putting a card in Supply does not pass initiative, so now you can summon a minion right away.',
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: true,
            onEnter(ctx) {
              ctx.client.ui.highlightedElement = null;
            }
          },
          {
            text: 'Play your Windblade Adept.',
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: false,
            advanceCondition: () => false,
            onEnter(ctx) {
              ctx.client.ui.highlightedElement = null;
            },
            gesture: {
              from(ctx) {
                const cardInHand =
                  ctx.game.playerSystem.player1.cardManager.hand[1];
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
            text: 'The <b>Suntide Maiden</b> in your hand is powerful enough to deal with it, but you cannot play this card at the moment.',
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: true,
            onEnter(ctx) {
              const suntideMaiden =
                ctx.game.playerSystem.player1.cardManager.hand[1];
              ctx.client.ui.highlightedElement =
                ctx.client.ui.DOMSelectors.cardInHand(
                  suntideMaiden.id,
                  ctx.game.playerSystem.player1.id
                ).element;
            }
          },
          {
            text: 'She needs two Lyonar <b>Affinities</b> to be played.',
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
            text: "Since you cannot play her for now, let's put the Suntide Maiden in the Supply Zone and play the Silverguard Knight.",
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
        async setup(ctx) {
          ctx.meta.windbladeAdept = ctx.game.playerSystem.player1.boardSide.base
            .map(space => space.card)
            .find(card => card?.blueprintId === 'tutorial-windblade-adept');

          ctx.meta.destination =
            ctx.game.playerSystem.player1.boardSide.leftBattlefield.spaces[0];
        },
        teardown() {},
        failedCondition: () => false,
        solveCondition(ctx) {
          return (ctx.meta.windbladeAdept as MinionCard).isOnBattlefield;
        },
        validateInput(input, ctx) {
          return validateMovingMinion(
            ctx.meta.windbladeAdept,
            input,
            ctx.meta.destination
          );
        },
        textBoxes: [
          {
            text: 'Seems like the enemy also had another minion to play.',
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
                  type: 'selectSpaceOnBoard',
                  payload: {
                    playerId: p2.id,
                    id: p2.boardSide.base[4].id
                  }
                })
              ]);
            }
          },
          {
            text: 'Move your Windblade Adept to the battlefield.',
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: false,
            advanceCondition() {
              return false;
            },
            gesture: {
              from(ctx) {
                const space = (ctx.meta.windbladeAdept as MinionCard).position!;
                return ctx.client.ui.DOMSelectors.boardSpace(space.id).element;
              },
              to(ctx) {
                return ctx.client.ui.DOMSelectors.boardSpace(
                  ctx.meta.destination.id
                ).element;
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
            text: 'The Bloodbound Executor is joining the fight!',
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: true,
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
            }
          },
          {
            text: 'Moving, attacking and scoring do not cost any mana. Score with your Windblade Adept to gain influence.',
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: false,
            advanceCondition: () => false,
            gesture: {
              from(ctx) {
                const space = (ctx.meta.windbladeAdept as MinionCard).position;
                if (!space) return null;
                return ctx.client.ui.DOMSelectors.boardSpace(space.id).element;
              },
              to(ctx) {
                const destinyCard =
                  ctx.game.playerSystem.player1.boardSide.leftBattlefield
                    .destinyCard;
                if (!destinyCard) return null;
                return ctx.client.ui.DOMSelectors.cardOnBoard(destinyCard.id)
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
        },
        teardown() {},
        solveCondition(ctx) {
          // the next step explains the affinity choice while it is on screen
          return (
            ctx.game.turnSystem.elapsedTurns === 1 &&
            ctx.game.interaction.getState() ===
              INTERACTION_STATES.CHOOSING_CARDS
          );
        },
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
            text: 'Ouch! The Executor destroyed your exhausted Windblade Adept. Luckily, its influence stays, so you are still ahead.',
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
            text: "You are out of mana, so let's pass to end the turn.",
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
            // a single text box: the choice modal blocks clicks outside of it, so a "Next" button might not be usable
            text: 'These two cards come from your <b>Affinity deck</b>. Each turn, you pick one to add to your Affinity Zone. In this mission your deck only has Lyonar affinities, so either choice works. With different affinities in your deck, you could play cards from several factions!',
            left: '10%',
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
          ctx.meta.lionheartBlessing = findCardInHand(
            ctx,
            'tutorial-lionheart-blessing'
          );
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
            text: 'Your supplied cards came back to your hand, but your mana was emptied. Mana never carries over to the next turn.',
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
            text: 'You drew a <b>Spell</b>: True Strike! Spells have an immediate effect instead of being summoned. This one can destroy the Bloodbound Executor.',
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
            text: 'First, you need some mana. Put your Windblade Adept in the Supply Zone.',
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
            text: 'With two Lyonar affinities, you can now play the Suntide Maiden. She costs 3 mana, but you only have 1 left.',
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
            text: 'Your Silverguard Knight supplies 3 mana. Put it in the Supply Zone, then play the Suntide Maiden.',
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
            left: '50%',
            top: '25%',
            canManuallyAdvance: true,
            onEnter(ctx) {
              ctx.client.ui.highlightedElement =
                ctx.client.ui.DOMSelectors.cardCommandment(
                  (ctx.meta.shaman as MinionCard).id
                ).element;
            }
          },
          {
            text: 'Luckily, you drew <b>Lionheart Blessing</b>. It gives an ally minion +2 influence, so cast it before scoring!',
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: true,
            onEnter(ctx) {
              ctx.client.ui.highlightedElement = null;
              ctx.client.ui.highlightedCard = getCardViewModel(
                ctx,
                ctx.meta.lionheartBlessing
              );
            }
          },
          {
            text: "You're on your own now! Win the battlefield to claim your second Victory Point.",
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: false,
            advanceCondition: () => false,
            onEnter(ctx) {
              ctx.client.ui.highlightedCard = null;
            }
          }
        ]
      }
    ]
  }
};
