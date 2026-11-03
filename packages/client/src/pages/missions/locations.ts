import type { TutorialMission } from '.';
import { makeTutorialDeck } from './utils';
import {
  cardInHandElement,
  cardOnBoardElement,
  dispatchSequence,
  emptyBaseSpaceElement,
  findOpponentCardInHand,
  findOpponentMinion,
  getCardViewModel,
  getLocationCard,
  getEmptyBaseSpaces,
  startOpponentAI,
  supplyZoneElement,
  validateMovingMinion,
  validatePlayingCard,
  validateScoring,
  validateSupplyCard,
  startFreePlay,
  isFreePlayFailed,
  type BattlefieldZone,
  findPlayerMinion
} from '../../tutorial/tutorial-utils';
import { CARD_LOCATIONS } from '@game/engine/src/card/card.enums';
import type { MinionCard } from '@game/engine/src/card/entities/minion.entity';
import type { AnyCard } from '@game/engine/src/card/entities/card.entity';
import type {
  TutorialContext,
  TutorialStepValidationResult
} from '@game/engine/src/tutorial/v2/tutorial';
import type { SerializedInput } from '@game/engine/src/input/input-system';
import { GAME_EVENTS } from '@game/engine/src/game/game.events';
import {
  GAME_PHASE_EVENTS,
  GAME_PHASES,
  INTERACTION_EVENTS,
  INTERACTION_STATES
} from '@game/engine/src/game/game.enums';
import type { Player } from '@game/engine/src/player/player.entity';

const validateAttacking = (
  attacker: MinionCard,
  target: MinionCard,
  input: SerializedInput
): TutorialStepValidationResult => {
  if (
    input.type === 'declareAttack' &&
    input.payload.attackerId === attacker.id &&
    input.payload.targetId === target.id
  ) {
    return { isValid: true };
  }
  return {
    isValid: false,
    reason: `Attack the ${target.blueprint.name} with your ${attacker.blueprint.name}.`
  };
};

// whenever the opponent gets the initiative this turn, it plays the next scripted action, then passes once there is none left
const makeOpponentFollowScript = (
  ctx: TutorialContext,
  actions: Array<Array<() => SerializedInput>>
) => {
  const p2 = ctx.game.playerSystem.player2;
  const remainingActions = [...actions];
  const unsub = ctx.game.on(GAME_EVENTS.TURN_INITATIVE_CHANGE, event => {
    if (!event.data.newInitiativePlayer.equals(p2)) return;
    const action = remainingActions.shift() ?? [
      () => ({ type: 'pass', payload: { playerId: p2.id } })
    ];
    // not awaited: the input that gave the initiative is still resolving, the action starts once it is done
    dispatchSequence(ctx, action);
  });
  ctx.game.once(GAME_EVENTS.TURN_START, unsub);
};

const getLocationElement = (ctx: TutorialContext, zone: BattlefieldZone) => {
  // while the Locations rotate at the start of a turn, a battlefield briefly has none
  const location = getLocationCard(ctx, zone) as AnyCard | null;
  if (!location) return null;
  return cardOnBoardElement(ctx, location);
};

const isWaitingForChoice = (ctx: TutorialContext, player: Player) => {
  if (ctx.game.interaction.getState() !== INTERACTION_STATES.CHOOSING_CARDS) {
    return false;
  }
  return ctx.game.interaction
    .getContext<'choosing_cards'>()
    .ctx.serialize()
    .players.includes(player.id);
};

// the mulligan happens in the draw phase, the affinity choice in the supply phase
const isMulligan = (ctx: TutorialContext) =>
  ctx.game.gamePhaseSystem.getState() === GAME_PHASES.DRAW;

// whenever the opponent has to choose cards, it keeps its whole hand or picks its first affinity
const makeOpponentAnswerChoices = (ctx: TutorialContext) => {
  const p2 = ctx.game.playerSystem.player2;
  return ctx.game.on(
    INTERACTION_EVENTS.INTERACTION_AFTER_CHANGE_STATE,
    event => {
      if (event.data.to.state !== INTERACTION_STATES.CHOOSING_CARDS) return;
      // the game only waits for the choice once this event is over
      setTimeout(() => {
        if (!isWaitingForChoice(ctx, p2)) return;
        void ctx.game.dispatch({
          type: 'chooseCards',
          payload: { playerId: p2.id, indices: isMulligan(ctx) ? [] : [0] }
        });
      });
    }
  );
};

// for choices that resolve after the input that answered them, when no input will end at the right time
const goToNextStepOn = (
  ctx: TutorialContext,
  subscribe: (callback: () => void) => () => void
) => {
  let isDone = false;
  const unsub = subscribe(() => {
    if (isDone) return;
    isDone = true;
    // lets the game finish what it was doing first
    setTimeout(() => {
      unsub();
      void ctx.next();
    });
  });
};

export const locationsTutorial: TutorialMission = {
  id: 'locations',
  name: 'Mission 4: Locations & Tactics',
  options: {
    gameOptions: {
      players: [
        {
          id: 'p1',
          name: 'You',
          deck: {
            cards: makeTutorialDeck([
              // starting hand, the mulligan replaces the Decimates
              ['tutorial-windblade-adept', 1],
              ['decimate', 2],
              // already on the right battlefield when the mission starts
              ['tutorial-sunbreaker', 1],
              ['tutorial-azurite-lion', 1],
              // drawn by the mulligan
              ['tutorial-ironcliffe-guardian', 1],
              ['tutorial-silverguard-knight', 1],
              // turn 2 draws
              ['tutorial-windblade-adept', 10],
              // left Location on turn 1, then on turn 3
              ['tutorial-moonlit-pass', 2],
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
              ['bloodbound-shaman', 1],
              // already on the right battlefield when the mission starts
              ['bloodbound-shaman', 1],
              ['bloodbound-invader', 10],
              // right Location on turn 1, then left Location on turn 2
              ['tutorial-bloodsun-arena', 1],
              ['tutorial-mistveil-marsh', 1],
              ['fire-affinity', 10]
            ])
          }
        }
      ],
      rngSeed: 'tutorial-seed',
      history: [],
      overrides: {
        config: {
          // the mission is about how Locations change from one turn to the next
          SHOULD_ROTATE_LOCATIONS: true,
          SHUFFLE_DECK_ON_GAME_START: false,
          CARDS_DRAWN_PER_TURN: 4,
          CARDS_MULLIGANED_PER_TURN: 2,
          INITIAL_HAND_SIZE: 0,
          PLAYER_1_CARDS_DRAWN_ON_FIRST_TURN: 3,
          PLAYER_2_CARDS_DRAWN_ON_FIRST_TURN: 5,
          START_OF_GAME_MULLIGANED_CARDS: 2,
          // the right battlefield on turn 1, then both battlefields on turn 2
          VICTORY_POINTS_TO_WIN: 3
        }
      }
    },
    boardType: 'double',
    meta: {},
    steps: [
      {
        id: 0,
        canRetry: () => false,
        failedCondition: () => false,
        meta: {},
        async setup(ctx) {
          ctx.client.ui.displayedElements.battleLog = false;
          const p1 = ctx.game.playerSystem.player1;
          const p2 = ctx.game.playerSystem.player2;

          // the battle is already under way when the mission starts
          const [sunbreaker, lion] = p1.cardManager.mainDeck.draw(
            2
          ) as MinionCard[];
          await sunbreaker.playImmediatelyAt(
            p1.boardSide.rightBattlefield.spaces[1],
            { shouldExhaust: false }
          );
          await lion.playImmediatelyAt(
            p1.boardSide.rightBattlefield.spaces[0],
            { shouldExhaust: false }
          );
          const [shaman] = p2.cardManager.mainDeck.draw(1) as MinionCard[];
          await shaman.playImmediatelyAt(
            p2.boardSide.rightBattlefield.spaces[1],
            { shouldExhaust: false }
          );

          ctx.meta.sunbreaker = sunbreaker;
          ctx.meta.lion = lion;
          ctx.meta.shaman = shaman;
          ctx.meta.adept = p1.cardManager.hand.find(
            card => card.blueprintId === 'tutorial-windblade-adept'
          );

          // the mulligan started before this step, the opponent keeps its hand
          await ctx.game.interaction
            .getContext<'choosing_cards'>()
            .ctx.commit(p2, []);
          ctx.meta.stopOpponentChoices = makeOpponentAnswerChoices(ctx);

          await ctx.game.snapshotSystem.takeSnapshot();
        },
        teardown() {},
        solveCondition(ctx) {
          return !(
            isMulligan(ctx) &&
            isWaitingForChoice(ctx, ctx.game.playerSystem.player1)
          );
        },
        validateInput(input, ctx) {
          const reason = 'Select both Decimates, then confirm.';
          if (input.type !== 'chooseCards' || !isMulligan(ctx)) {
            return { isValid: false, reason };
          }
          const choices = ctx.game.interaction
            .getContext<'choosing_cards'>()
            .ctx.getChoices(ctx.game.playerSystem.player1);
          const picked = input.payload.indices.map(index => choices[index]);
          const isValid =
            picked.length === 2 &&
            picked.every(choice => choice?.card.blueprintId === 'decimate');
          return isValid ? { isValid: true } : { isValid: false, reason };
        },
        textBoxes: [
          {
            text: 'The Bloodbound clan is back for another assault! (again...)',
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: true
          },
          {
            text: 'Before the battle starts, you can replace up to 2 cards of your starting hand: this is a <b>mulligan</b>. The cards you pick go to the bottom of your deck, and you draw as many new ones.',
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: true
          },
          {
            text: 'Your two <b>Decimates</b> cost 7 mana each, far more than you will have in this battle. Select both of them, then confirm.',
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: false,
            advanceCondition: () => false
          }
        ]
      },
      {
        id: 1,
        canRetry: () => false,
        failedCondition: () => false,
        meta: {},
        setup(ctx) {
          // the start of game choices resolve after the inputs that answered them, so wait for the main phase itself
          goToNextStepOn(ctx, callback =>
            ctx.game.on(GAME_PHASE_EVENTS.AFTER_CHANGE_PHASE, event => {
              if (event.data.to.state === GAME_PHASES.MAIN) callback();
            })
          );
        },
        teardown() {},
        solveCondition: () => false,
        validateInput(input) {
          if (input.type === 'chooseCards') return { isValid: true };
          return { isValid: false, reason: 'Choose your affinity.' };
        },
        textBoxes: [
          {
            text: 'You drew an <b>Ironcliffe Guardian</b> and a <b>Silverguard Knight</b> instead, much better! Now choose your affinity for this turn.',
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: false,
            advanceCondition: () => false
          }
        ]
      },
      {
        id: 2,
        canRetry: () => false,
        failedCondition: () => false,
        meta: {},
        setup(ctx) {
          ctx.meta.guardian =
            ctx.game.playerSystem.player1.cardManager.hand.find(
              card => card.blueprintId === 'tutorial-ironcliffe-guardian'
            );
        },
        teardown() {},
        solveCondition(ctx) {
          return !(ctx.meta.shaman as MinionCard).isOnBoard;
        },
        validateInput(input, ctx) {
          return validateAttacking(ctx.meta.sunbreaker, ctx.meta.shaman, input);
        },
        textBoxes: [
          {
            text: "Each battlefield has a <b>Location</b>. A Location changes the rules for every minion fighting there, yours and your enemy's.",
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: true
          },
          {
            text: 'On the left battlefield, the <b>Moonlit Pass</b> gives +1 influence to every minion.',
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: true,
            onEnter(ctx) {
              ctx.client.ui.highlightedElement = getLocationElement(
                ctx,
                CARD_LOCATIONS.LEFT_BATTLEFIELD
              );
            }
          },
          {
            text: 'On the right battlefield, the <b>Bloodsun Arena</b> gives +1 attack to every minion. Hover a Location at any time to read its effect.',
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: true,
            onEnter(ctx) {
              ctx.client.ui.highlightedElement = getLocationElement(
                ctx,
                CARD_LOCATIONS.RIGHT_BATTLEFIELD
              );
            }
          },
          {
            text: 'Your Sunbreaker is fighting in the Arena. It has <b>Overwhelm</b>: when it destroys a minion, the extra damage becomes influence on its battlefield.',
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: true,
            onEnter(ctx) {
              ctx.client.ui.highlightedElement = null;
              ctx.client.ui.highlightedCard = getCardViewModel(
                ctx,
                ctx.meta.sunbreaker
              );
            }
          },
          {
            text: 'Attack the Bloodbound Shaman with your Sunbreaker.',
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: false,
            advanceCondition: () => false,
            onEnter(ctx) {
              ctx.client.ui.highlightedCard = null;
            },
            gesture: {
              from(ctx) {
                return cardOnBoardElement(ctx, ctx.meta.sunbreaker);
              },
              to(ctx) {
                const shaman = ctx.meta.shaman as MinionCard;
                if (!shaman.isOnBoard) return null;
                return cardOnBoardElement(ctx, shaman);
              }
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
          return (
            (ctx.meta.guardian as AnyCard).location === CARD_LOCATIONS.BASE
          );
        },
        validateInput(input, ctx) {
          const adept = ctx.meta.adept as AnyCard;
          if (adept.location !== CARD_LOCATIONS.SUPPLY) {
            return validateSupplyCard(adept, input, ctx);
          }
          return validatePlayingCard(
            ctx.meta.guardian,
            input,
            ctx,
            getEmptyBaseSpaces(ctx)
          );
        },
        textBoxes: [
          {
            text: 'The Sunbreaker dealt 4 damage to a Shaman with 1 health: the 3 extra damage became 3 influence!',
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: true,
            hideDuringOpponentInitiative: true,
            onEnter(ctx) {
              ctx.client.ui.highlightedElement =
                ctx.client.ui.DOMSelectors.influence(
                  ctx.game.playerSystem.player1.id,
                  CARD_LOCATIONS.RIGHT_BATTLEFIELD
                ).element;
              const p2 = ctx.game.playerSystem.player2;
              dispatchSequence(ctx, [
                () => ({
                  type: 'declarePlayCard',
                  payload: {
                    playerId: p2.id,
                    id: findOpponentCardInHand(ctx, 'bloodbound-invader').id
                  }
                }),
                () => ({ type: 'supplyCard', payload: { playerId: p2.id } }),
                () => ({
                  type: 'declarePlayCard',
                  payload: {
                    playerId: p2.id,
                    id: findOpponentCardInHand(ctx, 'bloodbound-invader').id
                  }
                }),
                () => ({ type: 'supplyCard', payload: { playerId: p2.id } }),
                () => ({
                  type: 'declarePlayCard',
                  payload: {
                    playerId: p2.id,
                    id: findOpponentCardInHand(ctx, 'bloodbound-executor').id
                  }
                }),
                () => ({
                  type: 'selectSpaceOnBoard',
                  payload: { playerId: p2.id, id: p2.boardSide.base[1].id }
                })
              ]);
            }
          },
          {
            text: 'The enemy summoned a <b>Bloodbound Executor</b>.',
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: true,
            onEnter(ctx) {
              const executor = findOpponentMinion(ctx, 'bloodbound-executor');
              if (!executor) return;
              ctx.client.ui.highlightedElement = cardOnBoardElement(
                ctx,
                executor
              );
            }
          },
          {
            text: 'Your Sunbreaker is wounded and exhausted, we need to defend him.',
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: true,
            onEnter(ctx) {
              const ironcliffe = findPlayerMinion(
                ctx,
                'tutorial-ironcliffe-guardian'
              );
              if (!ironcliffe) return;
              ctx.client.ui.highlightedElement = cardOnBoardElement(
                ctx,
                ironcliffe
              );
            }
          },
          {
            text: 'Your Ironcliffe Guardian has <b>Protector</b>: enemies at its battlefield can only attack it.',
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: true,
            onEnter(ctx) {
              ctx.client.ui.highlightedElement = null;
              ctx.client.ui.highlightedCard = getCardViewModel(
                ctx,
                ctx.meta.guardian
              );
            }
          },
          {
            text: 'Supply your Windblade Adept, then play the Ironcliffe Guardian.',
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: false,
            advanceCondition: () => false,
            onEnter(ctx) {
              ctx.client.ui.highlightedCard = null;
            },
            gesture: {
              from(ctx) {
                const adept = ctx.meta.adept as AnyCard;
                if (adept.location === CARD_LOCATIONS.HAND) {
                  return cardInHandElement(ctx, adept);
                }
                return cardInHandElement(ctx, ctx.meta.guardian);
              },
              to(ctx) {
                const adept = ctx.meta.adept as AnyCard;
                if (adept.location === CARD_LOCATIONS.HAND) {
                  return supplyZoneElement(ctx);
                }
                return emptyBaseSpaceElement(ctx);
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
          ctx.meta.executor = findOpponentMinion(ctx, 'bloodbound-executor');
          ctx.meta.guardianDestination =
            ctx.game.playerSystem.player1.boardSide.rightBattlefield.spaces[2];
        },
        teardown() {},
        solveCondition(ctx) {
          return (
            (ctx.meta.guardian as MinionCard).location ===
            CARD_LOCATIONS.RIGHT_BATTLEFIELD
          );
        },
        validateInput(input, ctx) {
          return validateMovingMinion(
            ctx.meta.guardian,
            input,
            ctx.meta.guardianDestination
          );
        },
        textBoxes: [
          {
            text: 'Move your Ironcliffe Guardian before the enemy attacks to protect your Sunbreaker.',
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
                    zone: CARD_LOCATIONS.RIGHT_BATTLEFIELD,
                    index: 1
                  }
                })
              ]);
            },
            gesture: {
              from(ctx) {
                const space = (ctx.meta.guardian as MinionCard).position;
                if (!space) return null;
                return ctx.client.ui.DOMSelectors.boardSpace(space.id).element;
              },
              to(ctx) {
                return ctx.client.ui.DOMSelectors.boardSpace(
                  ctx.meta.guardianDestination.id
                ).element;
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
          const p2 = ctx.game.playerSystem.player2;
          // the Shaman stays in the base until next turn
          makeOpponentFollowScript(ctx, [
            [
              () => ({
                type: 'declarePlayCard',
                payload: {
                  playerId: p2.id,
                  id: findOpponentCardInHand(ctx, 'bloodbound-invader').id
                }
              }),
              () => ({ type: 'supplyCard', payload: { playerId: p2.id } }),
              () => ({
                type: 'declarePlayCard',
                payload: {
                  playerId: p2.id,
                  id: findOpponentCardInHand(ctx, 'bloodbound-shaman').id
                }
              }),
              () => ({
                type: 'selectSpaceOnBoard',
                payload: { playerId: p2.id, id: p2.boardSide.base[2].id }
              })
            ]
          ]);
          // the turn ends inside the last pass, which is still resolving during the next turn's mulligan
          goToNextStepOn(ctx, callback =>
            ctx.game.on(
              INTERACTION_EVENTS.INTERACTION_AFTER_CHANGE_STATE,
              event => {
                if (
                  event.data.to.state === INTERACTION_STATES.CHOOSING_CARDS &&
                  isMulligan(ctx)
                ) {
                  callback();
                }
              }
            )
          );
        },
        teardown() {},
        solveCondition: () => false,
        validateInput(input, ctx) {
          const guardian = ctx.meta.guardian as MinionCard;
          const lion = ctx.meta.lion as MinionCard;

          const scoringResult = validateScoring(input, [guardian, lion]);
          if (scoringResult) return scoringResult;

          if (input.type === 'pass') {
            if (guardian.isExhausted && lion.isExhausted) {
              return { isValid: true };
            }
            return {
              isValid: false,
              reason: 'Score with both your minions before passing.'
            };
          }
          return {
            isValid: false,
            reason: 'Score with your Ironcliffe Guardian and your Azurite Lion.'
          };
        },
        textBoxes: [
          {
            text: 'With a Protector in the way, the Executor could only attack your Guardian.',
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
                    targetId: (ctx.meta.guardian as MinionCard).id
                  }
                })
              ]);
            }
          },
          {
            text: 'Thanks to the attack bonus from the Location, it was able to destroy it with its counterattack!',
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: true
          },
          {
            text: 'Score with your Guardian and your Azurite Lion to secure the right battlefield, then pass to end the turn.',
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: false,
            advanceCondition: () => false,
            // hides it once the turn ends, so it does not show over the affinity choice
            hideDuringOpponentInitiative: true,
            gesture: {
              from(ctx) {
                const minion = [
                  ctx.meta.guardian as MinionCard,
                  ctx.meta.lion as MinionCard
                ].find(minion => !minion.isExhausted);
                if (!minion?.position) return null;
                return ctx.client.ui.DOMSelectors.boardSpace(minion.position.id)
                  .element;
              },
              to(ctx) {
                const minion = [
                  ctx.meta.guardian as MinionCard,
                  ctx.meta.lion as MinionCard
                ].find(minion => !minion.isExhausted);
                if (!minion?.isOnBattlefield) return null;
                return getLocationElement(
                  ctx,
                  minion.location as BattlefieldZone
                );
              }
            }
          }
        ]
      },
      {
        id: 6,
        canRetry: () => false,
        failedCondition: () => false,
        meta: {},
        setup() {},
        teardown() {},
        solveCondition(ctx) {
          return (
            ctx.game.turnSystem.elapsedTurns === 1 &&
            ctx.game.gamePhaseSystem.getState() === GAME_PHASES.MAIN
          );
        },
        validateInput(input, ctx) {
          if (!isMulligan(ctx)) {
            if (input.type === 'chooseCards') return { isValid: true };
            return { isValid: false, reason: 'Choose your affinity.' };
          }
          if (
            input.type === 'chooseCards' &&
            input.payload.indices.length === 0
          ) {
            return { isValid: true };
          }
          return {
            isValid: false,
            reason: 'Keep both your cards: confirm without selecting any.'
          };
        },
        textBoxes: [
          {
            text: 'At the start of every turn, you can mulligan 2 other cards.',
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: true
          },
          {
            text: "This time you don't draw new cards right away. But you always draw back up to 4 cards after the mulligan, so every card you put away makes room for a new one.",
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: true
          },
          {
            text: 'You need your Silverguard Knight and your Windblade Adept this turn: confirm without selecting any card, then choose your affinity.',
            right: '22%',
            bottom: '45%',
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
          ctx.meta.secondShaman = findOpponentMinion(ctx, 'bloodbound-shaman');
          ctx.meta.lionDestination =
            ctx.game.playerSystem.player1.boardSide.leftBattlefield.spaces[1];
        },
        teardown() {},
        solveCondition(ctx) {
          return (
            (ctx.meta.lion as MinionCard).location ===
            CARD_LOCATIONS.LEFT_BATTLEFIELD
          );
        },
        validateInput(input, ctx) {
          return validateMovingMinion(
            ctx.meta.lion,
            input,
            ctx.meta.lionDestination
          );
        },
        textBoxes: [
          {
            text: 'Every turn, the Locations on the battlefield change.',
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: true
          },
          {
            text: 'The one on the right leaves the board, the one on the left slides to the right, and a new one arrived on the left.',
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: true,
            hideDuringOpponentInitiative: true
          },
          {
            text: "Locations come from players' Location decks. There will always be one location from each player in play.",
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: true
          },
          {
            text: 'Your opponent brought the <b>Mistveil Marsh</b>: minions on the left battlefield have +2 influence.',
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: true,
            onEnter(ctx) {
              ctx.client.ui.highlightedElement = getLocationElement(
                ctx,
                CARD_LOCATIONS.LEFT_BATTLEFIELD
              );
            }
          },
          {
            text: 'Your Moonlit Pass is now on the right battlefield: minions here have +1 influence.',
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: true,
            onEnter(ctx) {
              ctx.client.ui.highlightedElement = getLocationElement(
                ctx,
                CARD_LOCATIONS.RIGHT_BATTLEFIELD
              );
              const p2 = ctx.game.playerSystem.player2;
              dispatchSequence(
                ctx,
                [
                  () => ({
                    type: 'move',
                    payload: {
                      playerId: p2.id,
                      cardId: (ctx.meta.secondShaman as MinionCard).id,
                      zone: CARD_LOCATIONS.LEFT_BATTLEFIELD,
                      index: 1
                    }
                  })
                ],
                // the turn just started, so no client update would trigger the first input
                { immediate: true }
              );
            }
          },
          {
            text: 'Meanwhile, a Bloodbound Shaman moved to the left battlefield. Thanks to the Marsh, it would score 6 influence!',
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: true,
            onEnter(ctx) {
              ctx.client.ui.highlightedElement = cardOnBoardElement(
                ctx,
                ctx.meta.secondShaman
              );
            }
          },
          {
            text: "Minions can't move between battlefields: they have to move back to the base first.",
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: true,
            onEnter(ctx) {
              ctx.client.ui.highlightedElement = null;
            }
          },
          {
            text: 'But your Azurite Lion has <b>Flanking</b>: it can move straight to the other battlefield.',
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: true,
            onEnter(ctx) {
              ctx.client.ui.highlightedElement = null;
              ctx.client.ui.highlightedCard = getCardViewModel(
                ctx,
                ctx.meta.lion
              );
            }
          },
          {
            text: 'Move your Azurite Lion to the left battlefield.',
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: false,
            advanceCondition: () => false,
            onEnter(ctx) {
              ctx.client.ui.highlightedCard = null;
            },
            gesture: {
              from(ctx) {
                const space = (ctx.meta.lion as MinionCard).position;
                if (!space) return null;
                return ctx.client.ui.DOMSelectors.boardSpace(space.id).element;
              },
              to(ctx) {
                return ctx.client.ui.DOMSelectors.boardSpace(
                  ctx.meta.lionDestination.id
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
          return !(ctx.meta.secondShaman as MinionCard).isOnBoard;
        },
        validateInput(input, ctx) {
          return validateAttacking(ctx.meta.lion, ctx.meta.secondShaman, input);
        },
        textBoxes: [
          {
            text: 'The enemy summoned an Invader instead of scoring. Attack the Shaman with your Lion before it gets another chance!',
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: false,
            advanceCondition: () => false,
            hideDuringOpponentInitiative: true,
            onEnter(ctx) {
              const p2 = ctx.game.playerSystem.player2;
              dispatchSequence(ctx, [
                () => ({
                  type: 'declarePlayCard',
                  payload: {
                    playerId: p2.id,
                    id: findOpponentCardInHand(ctx, 'bloodbound-invader').id
                  }
                }),
                () => ({ type: 'supplyCard', payload: { playerId: p2.id } }),
                () => ({
                  type: 'declarePlayCard',
                  payload: {
                    playerId: p2.id,
                    id: findOpponentCardInHand(ctx, 'bloodbound-invader').id
                  }
                }),
                () => ({
                  type: 'selectSpaceOnBoard',
                  payload: { playerId: p2.id, id: p2.boardSide.base[0].id }
                })
              ]);
            },
            gesture: {
              from(ctx) {
                return cardOnBoardElement(ctx, ctx.meta.lion);
              },
              to(ctx) {
                const shaman = ctx.meta.secondShaman as MinionCard;
                if (!shaman.isOnBoard) return null;
                return cardOnBoardElement(ctx, shaman);
              }
            }
          }
        ]
      },
      {
        id: 9,
        canRetry: () => false,
        failedCondition: isFreePlayFailed,
        meta: {},
        async setup(ctx) {
          // the AI answers its own choices from now on
          ctx.meta.stopOpponentChoices();
          startFreePlay(ctx);
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
            text: 'Nice! With Flanking, a minion can answer threats on either battlefield.',
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: true,
            hideDuringOpponentInitiative: true
          },
          {
            text: "You're on your own now! Win both battlefields this turn to claim your last 2 Victory Points. Your Silverguard Knight could make the difference on the left.",
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: false,
            advanceCondition: () => false
          }
        ]
      }
    ]
  }
};
