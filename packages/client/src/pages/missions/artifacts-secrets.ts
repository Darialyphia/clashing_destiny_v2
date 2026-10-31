import type { TutorialMission } from '.';
import { makeTutorialDeck } from './utils';
import { waitFor } from '@game/shared';
import {
  cardInHandElement,
  cardOnBoardElement,
  dispatchSequence,
  emptyBaseSpaceElement,
  findCardInHand,
  findOpponentCardInHand,
  findOpponentMinion,
  getCardViewModel,
  getDestinyCard,
  getEmptyBaseSpaces,
  makeOpponentChooseAffinity,
  startOpponentAI,
  supplyZoneElement,
  validateMovingMinion,
  validatePlayingCard,
  validatePlayingSpell,
  validateScoring,
  validateSupplyCard,
  startFreePlay,
  isFreePlayFailed,
  type BattlefieldZone
} from '../../tutorial/tutorial-utils';
import { CARD_LOCATIONS } from '@game/engine/src/card/card.enums';
import type { MinionCard } from '@game/engine/src/card/entities/minion.entity';
import type { AnyCard } from '@game/engine/src/card/entities/card.entity';
import type { ArtifactCard } from '@game/engine/src/card/entities/artifact.entity';
import type { TutorialContext } from '@game/engine/src/tutorial/v2/tutorial';
import { GAME_EVENTS } from '@game/engine/src/game/game.events';
import { GAME_PHASES } from '@game/engine/src/game/game.enums';

// whenever the opponent gets the initiative, it scores with the given minion if it can, otherwise it passes
const makeOpponentScoreThenPass = (
  ctx: TutorialContext,
  minion: MinionCard
) => {
  const p2 = ctx.game.playerSystem.player2;
  const unsub = ctx.game.on(GAME_EVENTS.TURN_INITATIVE_CHANGE, async event => {
    if (!event.data.newInitiativePlayer.equals(p2)) return;
    await waitFor(500);
    // the input that gave the initiative is still resolving at this point, so canScore would be false
    // the dispatched input is queued until that input is done
    if (minion.isOnBattlefield && !minion.isExhausted) {
      ctx.game.dispatch({
        type: 'score',
        payload: { playerId: p2.id, minionId: minion.id }
      });
    } else {
      ctx.game.dispatch({ type: 'pass', payload: { playerId: p2.id } });
    }
  });
  ctx.game.once(GAME_EVENTS.TURN_START, unsub);
};

export const artifactsSecretsTutorial: TutorialMission = {
  id: 'artifacts-secrets',
  name: 'Mission 3: Artifacts & Secrets',
  nextMission: 'locations',
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
              ['tutorial-sunstone-templar', 1],
              ['tutorial-windblade-adept', 1],
              ['tutorial-holy-immolation', 1],
              // already on the left battlefield when the mission starts
              ['tutorial-silverguard-knight', 1],
              // turn 2 draws
              ['tutorial-arclyte-regalia', 1],
              ['tutorial-silverguard-knight', 1],
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
              // already on the battlefields when the mission starts
              ['bloodbound-invader', 1],
              ['bloodbound-shaman', 1],
              // turn 2 draws
              ['bloodbound-shaman', 1],
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
          CARDS_DRAWN_PER_TURN: 4,
          CARDS_MULLIGANED_PER_TURN: 0,
          INITIAL_HAND_SIZE: 0,
          PLAYER_1_CARDS_DRAWN_ON_FIRST_TURN: 4,
          PLAYER_2_CARDS_DRAWN_ON_FIRST_TURN: 4,
          START_OF_GAME_MULLIGANED_CARDS: 0,
          // each battlefield gives a point per turn, so this is two turns of winning both
          VICTORY_POINTS_TO_WIN: 4
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
          const [knight] = p1.cardManager.mainDeck.draw(1) as MinionCard[];
          await knight.playImmediatelyAt(
            p1.boardSide.leftBattlefield.spaces[1],
            {
              shouldExhaust: false
            }
          );
          const [invader, shaman] = p2.cardManager.mainDeck.draw(
            2
          ) as MinionCard[];
          await invader.playImmediatelyAt(
            p2.boardSide.leftBattlefield.spaces[1],
            { shouldExhaust: false }
          );
          await shaman.playImmediatelyAt(
            p2.boardSide.rightBattlefield.spaces[1],
            { shouldExhaust: false }
          );

          ctx.meta.knight = knight;
          ctx.meta.invader = invader;
          ctx.meta.shaman = shaman;
          const [adept, templar, secondAdept, holyImmolation] =
            p1.cardManager.hand;
          ctx.meta.adept = adept;
          ctx.meta.templar = templar;
          ctx.meta.secondAdept = secondAdept;
          ctx.meta.holyImmolation = holyImmolation;

          // auto select affinity for both players
          const interactionCtx =
            ctx.game.interaction.getContext<'choosing_cards'>();
          interactionCtx.ctx.commit(p1, [0]);
          interactionCtx.ctx.commit(p2, [0]);

          await ctx.game.snapshotSystem.takeSnapshot();
        },
        teardown() {},
        solveCondition(ctx) {
          return (
            !(ctx.meta.shaman as MinionCard).isOnBoard &&
            (ctx.meta.templar as MinionCard).location === CARD_LOCATIONS.BASE
          );
        },
        validateInput(input, ctx) {
          const adept = ctx.meta.adept as AnyCard;
          const templar = ctx.meta.templar as MinionCard;
          const shaman = ctx.meta.shaman as MinionCard;
          if (adept.location !== CARD_LOCATIONS.SUPPLY) {
            return validateSupplyCard(adept, input, ctx);
          }
          // the Templar leaves the hand as soon as it is declared, so check that it reached the board
          if (templar.location !== CARD_LOCATIONS.BASE) {
            return validatePlayingCard(
              templar,
              input,
              ctx,
              getEmptyBaseSpaces(ctx)
            );
          }
          // the On Enter effect asks for a target once the Templar is on the board
          if (
            input.type === 'selectCardOnBoard' &&
            input.payload.cardId === shaman.id
          ) {
            return { isValid: true };
          }
          return {
            isValid: false,
            reason: 'Target the Bloodbound Shaman.'
          };
        },
        textBoxes: [
          {
            text: 'The Bloodbound clan is attacking on two fronts!',
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: true
          },
          {
            text: 'This time, the battle is fought on <b>two battlefields</b>. Each one has its own influence, and minions can only fight enemies at their own battlefield.',
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: true
          },
          {
            text: 'At the end of each turn, every battlefield gives a <b>Victory Point</b> to the player with the most influence there. Win 4 to win the battle.',
            left: '10%',
            bottom: '35%',
            canManuallyAdvance: true,
            onEnter(ctx) {
              ctx.client.ui.highlightedElement =
                ctx.client.ui.DOMSelectors.victoryPoints(
                  ctx.game.playerSystem.player1.id
                ).element;
            }
          },
          {
            text: "The Bloodbound Shaman on the right battlefield has 4 influence. Let's deal with it before it scores.",
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: true,
            onEnter(ctx) {
              ctx.client.ui.highlightedElement = cardOnBoardElement(
                ctx,
                ctx.meta.shaman
              );
            }
          },
          {
            text: 'Your Sunstone Templar has an <b>On Enter</b> effect. It triggers when you play the Templar from your hand.',
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: true,
            onEnter(ctx) {
              ctx.client.ui.highlightedElement = null;
              ctx.client.ui.highlightedCard = getCardViewModel(
                ctx,
                ctx.meta.templar
              );
            }
          },
          {
            text: 'Supply a Windblade Adept, then play the Sunstone Templar and target the Shaman with its effect.',
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
                const templar = ctx.meta.templar as AnyCard;
                if (adept.location === CARD_LOCATIONS.HAND) {
                  return cardInHandElement(ctx, adept);
                }
                if (templar.location === CARD_LOCATIONS.HAND) {
                  return cardInHandElement(ctx, templar);
                }
                return cardOnBoardElement(ctx, templar);
              },
              to(ctx) {
                const adept = ctx.meta.adept as AnyCard;
                const templar = ctx.meta.templar as AnyCard;
                const shaman = ctx.meta.shaman as MinionCard;
                if (adept.location === CARD_LOCATIONS.HAND) {
                  return supplyZoneElement(ctx);
                }
                if (templar.location === CARD_LOCATIONS.HAND) {
                  return emptyBaseSpaceElement(ctx);
                }
                if (!shaman.isOnBoard) return null;
                return cardOnBoardElement(ctx, shaman);
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
          ctx.meta.leftDestiny = getDestinyCard(
            ctx,
            CARD_LOCATIONS.LEFT_BATTLEFIELD
          );
        },
        teardown() {},
        solveCondition(ctx) {
          const secret =
            ctx.game.playerSystem.player1.boardSide.leftBattlefield.secretCard;
          return !!secret?.equals(ctx.meta.holyImmolation);
        },
        validateInput(input, ctx) {
          const secondAdept = ctx.meta.secondAdept as AnyCard;
          if (secondAdept.location !== CARD_LOCATIONS.SUPPLY) {
            return validateSupplyCard(secondAdept, input, ctx);
          }
          return validatePlayingSpell(ctx.meta.holyImmolation, input, ctx, [
            ctx.meta.leftDestiny
          ]);
        },
        textBoxes: [
          {
            text: 'The Shaman is destroyed! But the enemy just summoned a <b>Bloodbound Executor</b>.',
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: true,
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
                  payload: { playerId: p2.id, id: p2.boardSide.base[2].id }
                })
              ]);
            }
          },
          {
            text: 'With 4 attack, it can destroy your Silverguard Knight on the left battlefield.',
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
            text: "Luckily, you drew a <b>Secret</b>! Secrets are played face down at a battlefield, so your opponent can't see them coming.",
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: true,
            onEnter(ctx) {
              ctx.client.ui.highlightedElement = null;
              ctx.client.ui.highlightedCard = getCardViewModel(
                ctx,
                ctx.meta.holyImmolation
              );
            }
          },
          {
            text: 'Playing a secret only costs 1 mana. The rest is paid when it triggers, so keep enough mana for it!',
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: true,
            async onEnter(ctx) {
              await waitFor(100);
              ctx.client.ui.highlightedElement =
                ctx.client.ui.DOMSelectors.highlightedCardMana().element;
            }
          },
          {
            text: 'Supply your other Windblade Adept, then drag Holy Immolation onto the left battlefield.',
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
                const secondAdept = ctx.meta.secondAdept as AnyCard;
                if (secondAdept.location === CARD_LOCATIONS.HAND) {
                  return cardInHandElement(ctx, secondAdept);
                }
                return cardInHandElement(ctx, ctx.meta.holyImmolation);
              },
              to(ctx) {
                const secondAdept = ctx.meta.secondAdept as AnyCard;
                if (secondAdept.location === CARD_LOCATIONS.HAND) {
                  return supplyZoneElement(ctx);
                }
                return cardOnBoardElement(ctx, ctx.meta.leftDestiny);
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
          ctx.meta.executor = findOpponentMinion(ctx, 'bloodbound-executor');
          ctx.meta.templarDestination =
            ctx.game.playerSystem.player1.boardSide.rightBattlefield.spaces[1];
        },
        teardown() {},
        solveCondition(ctx) {
          return (
            (ctx.meta.templar as MinionCard).location ===
            CARD_LOCATIONS.RIGHT_BATTLEFIELD
          );
        },
        validateInput(input, ctx) {
          return validateMovingMinion(
            ctx.meta.templar,
            input,
            ctx.meta.templarDestination
          );
        },
        textBoxes: [
          {
            text: 'The Executor moved to the left battlefield. It is about to attack your Knight!',
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
                    index: 0
                  }
                })
              ]);
            }
          },
          {
            text: "Don't worry, your secret is waiting. Minions in your base can move to either battlefield: move your Sunstone Templar to the right one, which is now empty.",
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: false,
            advanceCondition: () => false,
            onEnter(ctx) {
              ctx.client.ui.highlightedElement = null;
            },
            gesture: {
              from(ctx) {
                const space = (ctx.meta.templar as MinionCard).position;
                if (!space) return null;
                return ctx.client.ui.DOMSelectors.boardSpace(space.id).element;
              },
              to(ctx) {
                return ctx.client.ui.DOMSelectors.boardSpace(
                  ctx.meta.templarDestination.id
                ).element;
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
        async setup(ctx) {
          makeOpponentScoreThenPass(ctx, ctx.meta.invader);
          makeOpponentChooseAffinity(ctx);
        },
        teardown() {},
        solveCondition(ctx) {
          return (
            ctx.game.turnSystem.elapsedTurns === 1 &&
            ctx.game.gamePhaseSystem.getState() === GAME_PHASES.MAIN
          );
        },
        validateInput(input, ctx) {
          const knight = ctx.meta.knight as MinionCard;
          const templar = ctx.meta.templar as MinionCard;
          // needed to pick an affinity when the next turn starts
          if (input.type === 'chooseCards') return { isValid: true };

          const scoringResult = validateScoring(input, [knight, templar]);
          if (scoringResult) return scoringResult;

          if (input.type === 'pass') {
            if (knight.isExhausted && templar.isExhausted) {
              return { isValid: true };
            }
            return {
              isValid: false,
              reason: 'Score with both your minions before passing.'
            };
          }
          return {
            isValid: false,
            reason:
              'Score with your Silverguard Knight and your Sunstone Templar.'
          };
        },
        textBoxes: [
          {
            text: 'The Executor attacked your Knight and walked right into your trap!',
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
                    targetId: (ctx.meta.knight as MinionCard).id
                  }
                })
              ]);
            }
          },
          {
            text: "The rest of Holy Immolation's cost was paid when it triggered.",
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
            text: 'Score with your Knight and your Templar to win both battlefields, then pass to end the turn.',
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: false,
            advanceCondition: () => false,
            // hides it once the turn ends, so it does not show over the affinity choice
            hideDuringOpponentInitiative: true,
            onEnter(ctx) {
              ctx.client.ui.highlightedElement = null;
            },
            gesture: {
              from(ctx) {
                const minion = [
                  ctx.meta.knight as MinionCard,
                  ctx.meta.templar as MinionCard
                ].find(minion => !minion.isExhausted);
                if (!minion?.position) return null;
                return ctx.client.ui.DOMSelectors.boardSpace(minion.position.id)
                  .element;
              },
              to(ctx) {
                const minion = [
                  ctx.meta.knight as MinionCard,
                  ctx.meta.templar as MinionCard
                ].find(minion => !minion.isExhausted);
                if (!minion?.isOnBattlefield) return null;
                return cardOnBoardElement(
                  ctx,
                  getDestinyCard(ctx, minion.location as BattlefieldZone)
                );
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
          ctx.meta.regalia = findCardInHand(ctx, 'tutorial-arclyte-regalia');
          ctx.meta.suppliedAdept = findCardInHand(
            ctx,
            'tutorial-windblade-adept'
          );
          ctx.meta.secondKnight = findCardInHand(
            ctx,
            'tutorial-silverguard-knight'
          );
        },
        teardown() {},
        solveCondition(ctx) {
          return (ctx.meta.regalia as AnyCard).location === CARD_LOCATIONS.BASE;
        },
        validateInput(input, ctx) {
          const suppliedAdept = ctx.meta.suppliedAdept as AnyCard;
          if (suppliedAdept.location !== CARD_LOCATIONS.SUPPLY) {
            return validateSupplyCard(suppliedAdept, input, ctx);
          }
          return validatePlayingCard(
            ctx.meta.regalia,
            input,
            ctx,
            getEmptyBaseSpaces(ctx)
          );
        },
        textBoxes: [
          {
            text: 'You won both battlefields and gained 2 <b>Victory Points</b>. Halfway there!',
            left: '10%',
            bottom: '35%',
            canManuallyAdvance: true,
            hideDuringOpponentInitiative: true,
            onEnter(ctx) {
              ctx.client.ui.highlightedElement =
                ctx.client.ui.DOMSelectors.victoryPoints(
                  ctx.game.playerSystem.player1.id
                ).element;
              const p2 = ctx.game.playerSystem.player2;
              dispatchSequence(
                ctx,
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
                ],
                // the turn just started, so no client update would trigger the first input
                { immediate: true }
              );
            }
          },
          {
            text: "You drew an <b>Artifact</b>: the Arclyte Regalia. Artifacts stay in your base. They don't fight, but you can use their abilities.",
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: true,
            onEnter(ctx) {
              ctx.client.ui.highlightedElement = null;
              ctx.client.ui.highlightedCard = getCardViewModel(
                ctx,
                ctx.meta.regalia
              );
            }
          },
          {
            text: 'Supply a Windblade Adept, then play the Arclyte Regalia in your base.',
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: false,
            advanceCondition: () => false,
            onEnter(ctx) {
              ctx.client.ui.highlightedCard = null;
            },
            gesture: {
              from(ctx) {
                const suppliedAdept = ctx.meta.suppliedAdept as AnyCard;
                if (suppliedAdept.location === CARD_LOCATIONS.HAND) {
                  return cardInHandElement(ctx, suppliedAdept);
                }
                return cardInHandElement(ctx, ctx.meta.regalia);
              },
              to(ctx) {
                const suppliedAdept = ctx.meta.suppliedAdept as AnyCard;
                if (suppliedAdept.location === CARD_LOCATIONS.HAND) {
                  return supplyZoneElement(ctx);
                }
                return emptyBaseSpaceElement(ctx);
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
          ctx.meta.secondShaman = findOpponentMinion(ctx, 'bloodbound-shaman');
        },
        teardown() {},
        solveCondition(ctx) {
          const knight = ctx.meta.knight as MinionCard;
          return knight.commandment > knight.blueprint.commandment;
        },
        validateInput(input, ctx) {
          const regalia = ctx.meta.regalia as ArtifactCard;
          const knight = ctx.meta.knight as MinionCard;
          if (
            input.type === 'declareUseCardAbility' &&
            input.payload.cardId === regalia.id
          ) {
            return { isValid: true };
          }
          if (
            input.type === 'selectCardOnBoard' &&
            input.payload.cardId === knight.id
          ) {
            return { isValid: true };
          }
          return {
            isValid: false,
            reason:
              "Use the Arclyte Regalia's ability on your Silverguard Knight."
          };
        },
        textBoxes: [
          {
            text: 'The new Shaman joined the left battlefield. With the Invader, the enemy could reach 6 influence there!',
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
                    cardId: (ctx.meta.secondShaman as MinionCard).id,
                    zone: CARD_LOCATIONS.LEFT_BATTLEFIELD,
                    index: 0
                  }
                })
              ]);
            }
          },
          {
            text: "The Regalia's <b>Equip</b> ability gives a minion +2 influence. Using an ability costs mana and passes the initiative, just like playing a card.",
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: true,
            onEnter(ctx) {
              ctx.client.ui.highlightedElement = cardOnBoardElement(
                ctx,
                ctx.meta.regalia
              );
            }
          },
          {
            text: 'Hover your Arclyte Regalia and click the ability button below it, then select your Silverguard Knight.',
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: false,
            advanceCondition: () => false,
            onEnter(ctx) {
              ctx.client.ui.highlightedElement = null;
            },
            gesture: {
              from(ctx) {
                return cardOnBoardElement(ctx, ctx.meta.regalia);
              },
              to(ctx) {
                return cardOnBoardElement(ctx, ctx.meta.knight);
              }
            }
          }
        ]
      },
      {
        id: 6,
        canRetry: () => false,
        failedCondition: isFreePlayFailed,
        meta: {},
        async setup(ctx) {
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
            text: 'Your Silverguard Knight now has 5 influence!',
            left: '50%',
            top: '25%',
            canManuallyAdvance: true,
            hideDuringOpponentInitiative: true,
            onEnter(ctx) {
              ctx.client.ui.highlightedElement =
                ctx.client.ui.DOMSelectors.cardCommandment(
                  (ctx.meta.knight as MinionCard).id
                ).element;
            }
          },
          {
            text: 'Each time the equipped minion takes damage, the Regalia loses 1 durability. When it reaches 0, the Regalia is destroyed.',
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: true,
            onEnter(ctx) {
              ctx.client.ui.highlightedElement = cardOnBoardElement(
                ctx,
                ctx.meta.regalia
              );
            }
          },
          {
            text: "You're on your own now! Win both battlefields to claim your last 2 Victory Points. Your other Silverguard Knight could make the difference on the left.",
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
