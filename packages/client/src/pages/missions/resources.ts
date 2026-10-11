import type { TutorialMission } from '.';
import { makeTutorialDeck } from './utils';
import { isDefined, waitFor } from '@game/shared';
import type { PlayerViewModel } from '@game/engine/src/client/view-models/player.model';
import {
  dispatchSequence,
  validateMovingMinion,
  validatePlayingCard,
  validateSupplyCard
} from '../client/tutorial/tutorial-utils';
import { CARD_LOCATIONS } from '@game/engine/src/card/card.enums';
import { GAME_EVENTS } from '@game/engine/src/game/game.events';

export const resourcesTutorial: TutorialMission = {
  id: 'resources',
  name: 'Mission 2: Mana & Affinities',
  options: {
    gameOptions: {
      players: [
        {
          id: 'p1',
          name: 'You',
          deck: {
            cards: makeTutorialDeck([
              ['tutorial-windblade-adept', 1],
              ['tutorial-silverguard-knight', 1],
              ['tutorial-windblade-adept', 1],
              ['tutorial-suntide-maiden', 1],
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
              ['bloodbound-invader', 2],
              ['bloodbound-executor', 1],
              ['bloodbound-invader', 1],
              ['bloodbound-executor', 2],
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
            text: 'The Bloodbound clan is back once more !',
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: true
          },
          {
            text: 'We must establish a strong defense !',
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: true
          },
          {
            text: 'Cards cost <b>Mana</b> to play. ',
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
            text: 'This displays the how much mana you currently have.',
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
            text: 'Note that cards in the Supply Zone are face up, so your opponent can see them!',
            left: '10%',
            bottom: '35%',
            canManuallyAdvance: true
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
            text: 'Your opponent put 2cards in the Supply Zone and played a minion of their own.',
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
            text: 'That is because you do not have enough <b>Affinity</b>.',
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: true,
            onEnter(ctx) {
              ctx.client.ui.highlightedElement = null;
              ctx.client.ui.displayedElements.affinities = true;
            }
          },
          {
            text: 'Cards needs affinities to be played. For example, Suntide Maiden needs two Lyonar affinities.',
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: true,
            async onEnter(ctx) {
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
            text: 'You currently only have one Lyonar affinity.',
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
            text: "Since you cannot play her for now, let's put the Suntide Maiden in the Supply Zone and play the Silverguard Knight",
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: false,
            advanceCondition: () => false,
            onEnter(ctx) {
              ctx.client.ui.highlightedCard = null;
              ctx.client.ui.highlightedElement = null;
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
        failedCondition: ctx => {
          return ctx.game.playerSystem.player1.cardManager.discardPile.size > 0;
        },
        solveCondition(ctx) {
          const windbladeAdept = ctx.game.playerSystem.player1.boardSide.base
            .map(space => space.card)
            .find(card => card?.blueprintId === 'tutorial-windblade-adept');

          return !isDefined(windbladeAdept);
        },
        validateInput(input, ctx) {
          return { isValid: true };
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
            text: 'Try to win the Victory Point this turn without losing any minion',
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: false,
            advanceCondition() {
              return false;
            },
            gesture: {
              from(ctx) {
                const space = ctx.game.playerSystem.player1.boardSide.base.find(
                  space =>
                    space.card?.blueprintId === 'tutorial-windblade-adept'
                )!;

                return ctx.client.ui.DOMSelectors.boardSpace(space.id).element;
              },
              to(ctx) {
                const space =
                  ctx.game.playerSystem.player1.boardSide.leftBattlefield
                    .spaces[0];

                return ctx.client.ui.DOMSelectors.boardSpace(space.id).element;
              }
            }
          }
        ]
      }
    ]
  }
};
