import type { MinionCard } from '@game/engine/src/card/entities/minion.entity';
import type { TutorialMission } from '.';
import { z } from 'zod';
import { SummoningSicknessModifier } from '@game/engine/src/modifier/modifiers/summoning-sickness';
import { waitForElement } from '@/utils/dom-utils';

const meta: { footsoldier: MinionCard | null; slime: MinionCard | null } = {
  footsoldier: null,
  slime: null
};

export const combatTutorial: TutorialMission = {
  id: 'combat',
  name: 'Mission 1 : Attacking and Blocking',
  options: {
    players: [
      {
        id: 'p1',
        name: 'You',
        hero: 'knight',
        mainDeck: {
          cards: Array.from({ length: 30 }, () => 'courageous-footsoldier')
        },
        destinyDeck: {
          cards: ['fire-affinity']
        }
      },
      {
        id: 'p2',
        name: 'Opponent',
        hero: 'knight',
        mainDeck: {
          cards: Array.from({ length: 30 }, () => 'courageous-footsoldier')
        },
        destinyDeck: {
          cards: ['fire-affinity']
        }
      }
    ],
    rngSeed: 'tutorial-seed',
    history: [
      {
        type: 'skipDestiny',
        payload: { playerId: 'p1' }
      }
    ],
    config: {
      INITIAL_HAND_SIZE: 4,
      PLAYER_1_CARDS_DRAWN_ON_FIRST_TURN: 0,
      PLAYER_2_CARDS_DRAWN_ON_FIRST_TURN: 0
    },
    async setup(game) {
      meta.footsoldier =
        await game.playerSystem.player1.generateCard<MinionCard>(
          'courageous-footsoldier'
        );
      await meta.footsoldier.playAt({
        player: game.playerSystem.player1,
        zone: 'attack',
        slot: 2
      });
      await meta.footsoldier.modifiers.remove(SummoningSicknessModifier);

      meta.slime =
        await game.playerSystem.player2.generateCard<MinionCard>(
          'friendly-slime'
        );
      await meta.slime.playAt({
        player: game.playerSystem.player2,
        zone: 'attack',
        slot: 2
      });
    },
    steps: {
      root: {
        id: 'root',
        isRoot: true,
        validate(input) {
          const result = z
            .object({
              type: z.literal('declareAttack'),
              payload: z.object({
                playerId: z.literal('p1'),
                attackerId: z.literal(meta.footsoldier!.id)
              })
            })
            .safeParse(input);

          return result.success
            ? { status: 'success' }
            : {
                status: 'error',
                errorMessage:
                  'Declare an attack with your Courageous Footsoldier.'
              };
        },
        next: () => 'attack_1_declare_target',
        textBoxes: [
          {
            text: 'Welcome to the tutorial, you based and redpilled CCG enjoyer.',
            canGoNext: true
          },
          {
            text: 'In this tutorial, you will learn the basics of combat.',
            canGoNext: true
          },
          {
            text: 'You can attack with your Minions or your Hero',
            canGoNext: true
          },
          {
            text: 'Here are your minions...',
            canGoNext: true,
            onEnter(game, client) {
              client.ui.highlightedElement = document.querySelector(
                client.ui.DOMSelectors.p1Minionzone.selector
              ) as HTMLElement;
            }
          },
          {
            text: "...and here are your opponent's",
            canGoNext: true,
            onEnter(game, client) {
              client.ui.highlightedElement = document.querySelector(
                client.ui.DOMSelectors.p2Minionzone.selector
              ) as HTMLElement;
            }
          },
          {
            text: "Let's declare an attack. first, click on your Courageous Footsoldier.",
            canGoNext: false,
            onEnter(game, client, next) {
              client.ui.highlightedElement = document.querySelector(
                client.ui.DOMSelectors.minionSprite('p1', 'attack', 2).selector
              ) as HTMLElement;

              client.ui.DOMSelectors.minionClickableArea(
                'p1',
                'attack',
                2
              ).element!.addEventListener('click', next, {
                once: true
              });
            }
          },
          {
            text: '...then click on the attack button.',
            canGoNext: false,
            async onEnter(game, client) {
              const actionButton = await waitForElement(
                client.ui.DOMSelectors.cardAction(
                  meta.footsoldier!.id,
                  'declare_attack'
                ).selector
              );

              client.ui.highlightedElement = actionButton;
            }
          }
        ]
      },
      attack_1_declare_target: {
        id: 'attack_1_declare_target',
        isRoot: true,
        textBoxes: [
          {
            text: "Now click on your opponent's Friendly Slime to declare the attack.",
            canGoNext: true,
            onEnter(game, client) {
              const slimeEl = document.querySelector(
                client.ui.DOMSelectors.minionSprite('p2', 'attack', 2).selector
              ) as HTMLElement;
              client.ui.highlightedElement = slimeEl;
            },
            onLeave(game, client) {
              client.ui.highlightedElement = null;
            }
          }
        ],
        validate(input) {
          const result = z
            .object({
              type: z.literal('declareAttackTarget'),
              payload: z.object({
                playerId: z.literal('p1'),
                targetId: z.literal(meta.slime!.id)
              })
            })
            .safeParse(input);

          return result.success
            ? { status: 'success' }
            : {
                status: 'error',
                errorMessage: 'Click the slime to declare the attack.'
              };
        },
        next: () => null
      }
    }
  }
};
