import type { MinionCard } from '@game/engine/src/card/entities/minion.entity';
import type { TutorialMission } from '.';
import { makeTutorialDeck } from './utils';
import { isDefined, waitFor } from '@game/shared';
import { CARD_LOCATIONS } from '@game/engine/src/card/card.enums';
import type { PlayerViewModel } from '@game/engine/src/client/view-models/player.model';

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
              ['tutorial-windblade-adept', 2],
              ['tutorial-silverguard-knight', 2],
              ['tutorial-windblade-adept', 10],
              ['tutorial-silverguard-outpost', 1]
            ])
          }
        },
        {
          id: 'p2',
          name: 'Opponent',
          deck: {
            cards: makeTutorialDeck([
              ['bloodbound-invader', 2],
              ['bloodbound-executor', 2],
              ['bloodbound-invader', 10],
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
        },
        teardown() {},
        solveCondition(ctx) {
          return ctx.game.playerSystem.player1.cardManager.supply.size === 1;
        },
        validateInput(input, ctx) {
          const gamePhaseState = ctx.game.gamePhaseSystem.getState();
          if (gamePhaseState === 'main_phase') {
            if (input.type !== 'declarePlayCard') {
              return {
                isValid: false,
                reason: 'Put your Windblade Adept in the Supply Zone.'
              };
            }
            if (
              input.payload.id !==
              ctx.game.playerSystem.player1.cardManager.hand[0].id
            ) {
              return {
                isValid: false,
                reason: 'Put your Windblade Adept in the Supply Zone.'
              };
            }
          } else if (
            input.type !== 'supplyCard' &&
            input.type !== 'cancelInteraction' &&
            input.type !== 'cancelPlayingCard'
          ) {
            return {
              isValid: false,
              reason: 'Put your Windblade Adept in the Supply Zone.'
            };
          }
          return {
            isValid: true
          };
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
          const gamePhaseState = ctx.game.gamePhaseSystem.getState();
          if (gamePhaseState === 'main_phase') {
            if (input.type !== 'declarePlayCard') {
              return {
                isValid: false,
                reason: 'Play the Windblade Adept in your hand.'
              };
            }
            if (
              input.payload.id !==
              ctx.game.playerSystem.player1.cardManager.hand[1].id
            ) {
              return {
                isValid: false,
                reason: 'Put your Windblade Adept in the Supply Zone.'
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
            text: 'This displays the how much mana you currently have.',
            right: '22%',
            bottom: '45%',
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
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: true
          },
          {
            text: 'Putting a card in Supply does not pass initiative, so now you can summon a minion right away.',
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
            text: 'This is a new text box for the second mission.',
            right: '22%',
            bottom: '45%',
            canManuallyAdvance: true
          }
        ]
      }
    ]
  }
};
