// import type { MinionCard } from '@game/engine/src/card/entities/minion.entity';
import type { TutorialMission } from '.';
// import { z } from 'zod';
// import { SummoningSicknessModifier } from '@game/engine/src/modifier/modifiers/summoning-sickness';
// import { waitForElement } from '@/utils/dom-utils';
// import { GAME_PHASES } from '@game/engine/src/game/game.enums';
// import { COMBAT_STEPS } from '@game/engine/src/game/phases/combat.phase';
// import type { HeroCard } from '@game/engine/src/card/entities/hero.entity';
// import { isDefined } from '@game/shared';
// import { simpleStepValidation } from './utils';

// const meta: {
//   allyHero: HeroCard | null;
//   allyfootSoldier1: MinionCard | null;
//   allyfootSoldier2: MinionCard | null;
//   enemyHero: HeroCard | null;
//   enemySlime1: MinionCard | null;
//   enemySlime2: MinionCard | null;
//   enemySlime3: MinionCard | null;
// } = {
//   allyHero: null,
//   allyfootSoldier1: null,
//   allyfootSoldier2: null,
//   enemyHero: null,
//   enemySlime1: null,
//   enemySlime2: null,
//   enemySlime3: null
// };

export const combatTutorial: TutorialMission = {
  id: 'combat',
  name: 'Mission 2 : Combat',
  options: {
    next: 'play-cards',
    players: [
      {
        id: 'p1',
        name: 'You',
        spellSchools: [],
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
        spellSchools: [],
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
      // {
      //   type: 'skipDestiny',
      //   payload: { playerId: 'p1' }
      // }
    ],
    config: {
      INITIAL_HAND_SIZE: 4,
      PLAYER_1_CARDS_DRAWN_ON_FIRST_TURN: 0,
      PLAYER_2_CARDS_DRAWN_ON_FIRST_TURN: 0
    },
    async setup() {
      // client.ui.displayedElements.hand = false;
      // client.ui.displayedElements.playerInfos = false;
      // client.ui.displayedElements.artifacts = false;
      // client.ui.displayedElements.unlockedDestinyCards = false;
      // client.ui.displayedElements.destinyZone = false;
      // client.ui.displayedElements.actionButtons = false;
      // client.ui.displayedElements.destinyPhaseModal = false;
      // client.ui.displayedElements.phaseTracker = false;
      // client.ui.displayedElements.defenseZone = false;
      // meta.allyHero = game.playerSystem.player1.hero;
      // meta.allyHero.abilities.splice(0, -1);
      // meta.enemyHero = game.playerSystem.player2.hero;
      // meta.allyfootSoldier1 =
      //   await game.playerSystem.player1.generateCard<MinionCard>(
      //     'courageous-footsoldier'
      //   );
      // await meta.allyfootSoldier1.playAt({
      //   player: game.playerSystem.player1,
      //   zone: 'attack',
      //   slot: 2
      // });
      // await meta.allyfootSoldier1.modifiers.remove(SummoningSicknessModifier);
      // meta.enemySlime1 =
      //   await game.playerSystem.player2.generateCard<MinionCard>(
      //     'tutorial-slime-1'
      //   );
      // await meta.enemySlime1.playAt({
      //   player: game.playerSystem.player2,
      //   zone: 'attack',
      //   slot: 2
      // });
    },
    steps: {
      // root: {
      //   id: 'root',
      //   isRoot: true,
      //   validate: simpleStepValidation(
      //     () =>
      //       z.object({
      //         type: z.literal('declareAttack'),
      //         payload: z.object({
      //           playerId: z.literal('p1'),
      //           attackerId: z.literal(meta.allyfootSoldier1!.id)
      //         })
      //       }),
      //     'Declare an attack with your Courageous Footsoldier.'
      //   ),
      //   next: () => 'attack_1_declare_target',
      //   textBoxes: [
      //     {
      //       text: 'Welcome to the tutorial, you based and redpilled CCG enjoyer.',
      //       canGoNext: true
      //     },
      //     {
      //       text: 'In this tutorial, you will learn the basics of combat.',
      //       canGoNext: true
      //     },
      //     {
      //       text: 'You can attack with your Minions or your Hero',
      //       canGoNext: true
      //     },
      //     {
      //       text: 'Here are your minions...',
      //       canGoNext: true,
      //       onEnter(game, client) {
      //         client.ui.highlightedElement =
      //           client.ui.DOMSelectors.attackZone('p1').element;
      //       }
      //     },
      //     {
      //       text: "...and here are your opponent's",
      //       canGoNext: true,
      //       onEnter(game, client) {
      //         client.ui.highlightedElement =
      //           client.ui.DOMSelectors.attackZone('p2').element;
      //       }
      //     },
      //     {
      //       text: "Let's declare an attack. first, click on your Courageous Footsoldier.",
      //       canGoNext: false,
      //       onEnter(game, client, next) {
      //         client.ui.highlightedElement =
      //           client.ui.DOMSelectors.minionSprite('p1', 'attack', 2).element;
      //         client.ui.DOMSelectors.minionClickableArea(
      //           'p1',
      //           'attack',
      //           2
      //         ).element!.addEventListener('click', next, {
      //           once: true
      //         });
      //       }
      //     },
      //     {
      //       text: '...then click on the attack button.',
      //       canGoNext: false,
      //       async onEnter(game, client) {
      //         const actionButton = await waitForElement(
      //           client.ui.DOMSelectors.cardAction(
      //             meta.allyfootSoldier1!.id,
      //             'declare_attack'
      //           ).selector
      //         );
      //         client.ui.highlightedElement = actionButton;
      //       }
      //     }
      //   ]
      // },
      // attack_1_declare_target: {
      //   id: 'attack_1_declare_target',
      //   isRoot: false,
      //   validate: simpleStepValidation(
      //     () =>
      //       z.object({
      //         type: z.literal('declareAttackTarget'),
      //         payload: z.object({
      //           playerId: z.literal('p1'),
      //           targetId: z.literal(meta.enemySlime1!.id)
      //         })
      //       }),
      //     'Click the slime to declare the attack.'
      //   ),
      //   next: () => 'end_turn_1',
      //   onSuccess(game) {
      //     game.dispatch({
      //       type: 'declareBlocker',
      //       payload: {
      //         playerId: 'p2',
      //         blockerId: null
      //       }
      //     });
      //     game.dispatch({
      //       type: 'passChain',
      //       payload: {
      //         playerId: 'p2'
      //       }
      //     });
      //     game.dispatch({
      //       type: 'passChain',
      //       payload: {
      //         playerId: 'p1'
      //       }
      //     });
      //   },
      //   textBoxes: [
      //     {
      //       text: "Now click on your opponent's Friendly Slime to declare the attack.",
      //       canGoNext: false,
      //       onEnter(game, client) {
      //         const slimeEl = client.ui.DOMSelectors.minionSprite(
      //           'p2',
      //           'attack',
      //           2
      //         ).element;
      //         client.ui.highlightedElement = slimeEl;
      //       },
      //       onLeave(game, client) {
      //         client.ui.highlightedElement = null;
      //       }
      //     }
      //   ]
      // },
      // end_turn_1: {
      //   id: 'end_turn_1',
      //   isRoot: false,
      //   textBoxes: [
      //     { text: 'Both minions dealt damage to each other.', canGoNext: true },
      //     {
      //       text: "Since the Slime's HP got reduced to 0, it has been destroyed",
      //       canGoNext: true
      //     },
      //     {
      //       text: 'Press the End Turn button to end your turn',
      //       canGoNext: false,
      //       onEnter(game, client) {
      //         client.ui.displayedElements.actionButtons = true;
      //         client.ui.highlightedElement =
      //           client.ui.DOMSelectors.actionButton('end-turn').element;
      //       }
      //     }
      //   ],
      //   validate: simpleStepValidation(
      //     () =>
      //       z.object({
      //         type: z.literal('declareEndTurn'),
      //         payload: z.object({
      //           playerId: z.literal('p1')
      //         })
      //       }),
      //     'Click the End Turn button.'
      //   ),
      //   next: () => 'opponent_turn_1'
      // },
      // opponent_turn_1: {
      //   id: 'opponent_turn_1',
      //   isRoot: false,
      //   validate: simpleStepValidation(
      //     () =>
      //       z.object({
      //         type: z.literal('declareBlocker'),
      //         payload: z.object({
      //           playerId: z.literal('p2'),
      //           blockerId: z.literal(meta.enemySlime2!.id)
      //         })
      //       }),
      //     'Click the Block button to block the attack'
      //   ),
      //   next: () => 'turn_2_start',
      //   async onEnter(game, step, client) {
      //     client.ui.highlightedElement = null;
      //     game.dispatch({ type: 'passChain', payload: { playerId: 'p2' } });
      //     await client.waitUntil(
      //       state => state.phase.state === GAME_PHASES.DESTINY
      //     );
      //     game.dispatch({
      //       type: 'skipDestiny',
      //       payload: { playerId: 'p2' }
      //     });
      //     meta.enemySlime2 =
      //       await game.playerSystem.player2.generateCard<MinionCard>(
      //         'tutorial-slime-1'
      //       );
      //     await meta.enemySlime2.playAt({
      //       player: game.playerSystem.player2,
      //       zone: 'attack',
      //       slot: 2
      //     });
      //     await meta.enemySlime2.modifiers.remove(SummoningSicknessModifier);
      //   },
      //   textBoxes: [
      //     {
      //       text: 'Your opponent summoned another slime !',
      //       canGoNext: true
      //     },
      //     {
      //       text: 'Your footsoldier only has 1 HP left, and is vulnerable !',
      //       canGoNext: true,
      //       async onEnter(game, client) {
      //         game.dispatch({
      //           type: 'declareAttack',
      //           payload: {
      //             playerId: 'p2',
      //             attackerId: meta.enemySlime2!.id
      //           }
      //         });
      //         await client.waitUntil(
      //           state =>
      //             state.phase.state === GAME_PHASES.ATTACK &&
      //             state.phase.ctx.step === COMBAT_STEPS.DECLARE_TARGET
      //         );
      //         game.dispatch({
      //           type: 'declareAttackTarget',
      //           payload: {
      //             playerId: 'p2',
      //             targetId: meta.allyfootSoldier1!.id
      //           }
      //         });
      //       }
      //     },
      //     {
      //       text: 'Here are some reinforcements !',
      //       canGoNext: true,
      //       async onEnter(game, client) {
      //         client.ui.displayedElements.defenseZone = true;
      //         meta.allyfootSoldier2 =
      //           await game.playerSystem.player1.generateCard<MinionCard>(
      //             'courageous-footsoldier'
      //           );
      //         await meta.allyfootSoldier2.playAt({
      //           player: game.playerSystem.player1,
      //           zone: 'defense',
      //           slot: 2
      //         });
      //         game.snapshotSystem.takeSnapshot();
      //       }
      //     },
      //     {
      //       text: 'This second footsoldier is on the back row, called the Defense Zone.',
      //       canGoNext: true,
      //       onEnter(game, client) {
      //         client.ui.highlightedElement =
      //           client.ui.DOMSelectors.defenseZone('p1').element;
      //       }
      //     },
      //     {
      //       text: 'This means they can block enemy attacks.',
      //       canGoNext: true
      //     },
      //     {
      //       text: 'Select your footsoldier.',
      //       canGoNext: false,
      //       onEnter(game, client, next) {
      //         client.ui.highlightedElement =
      //           client.ui.DOMSelectors.minionSprite('p1', 'defense', 2).element;
      //         client.ui.DOMSelectors.minionClickableArea(
      //           'p1',
      //           'defense',
      //           2
      //         ).element!.addEventListener('click', next, {
      //           once: true
      //         });
      //       }
      //     },
      //     {
      //       text: '...then click on the Block button.',
      //       canGoNext: false,
      //       async onEnter(game, client) {
      //         const actionButton = await waitForElement(
      //           client.ui.DOMSelectors.cardAction(
      //             meta.allyfootSoldier2!.id,
      //             'declare_blocker'
      //           ).selector
      //         );
      //         client.ui.highlightedElement = actionButton;
      //       }
      //     }
      //   ]
      // },
      // turn_2_start: {
      //   id: 'turn_2_start',
      //   isRoot: false,
      //   validate: simpleStepValidation(
      //     () =>
      //       z.object({
      //         type: z.literal('declareAttack'),
      //         payload: z.object({
      //           playerId: z.literal('p1'),
      //           attackerId: z.literal(meta.allyfootSoldier1!.id)
      //         })
      //       }),
      //     'Declare an attack with your Courageous Footsoldier.'
      //   ),
      //   next: () => 'turn2_declare_target',
      //   async onEnter(game, step, client) {
      //     client.ui.highlightedElement = null;
      //     game.dispatch({
      //       type: 'passChain',
      //       payload: {
      //         playerId: 'p1'
      //       }
      //     });
      //     await client.waitUntil(state => state.effectChain?.player === 'p2');
      //     game.dispatch({
      //       type: 'passChain',
      //       payload: {
      //         playerId: 'p2'
      //       }
      //     });
      //     meta.enemySlime3 =
      //       await game.playerSystem.player2.generateCard<MinionCard>(
      //         'tutorial-slime-2'
      //       );
      //     await meta.enemySlime3.playAt({
      //       player: game.playerSystem.player2,
      //       zone: 'defense',
      //       slot: 1
      //     });
      //     await client.waitUntil(
      //       state => state.phase.state === GAME_PHASES.MAIN
      //     );
      //     game.dispatch({
      //       type: 'declareEndTurn',
      //       payload: {
      //         playerId: 'p2'
      //       }
      //     });
      //     game.dispatch({
      //       type: 'passChain',
      //       payload: {
      //         playerId: 'p1'
      //       }
      //     });
      //     await client.waitUntil(
      //       state => state.phase.state === GAME_PHASES.DESTINY
      //     );
      //     game.dispatch({
      //       type: 'skipDestiny',
      //       payload: { playerId: 'p1' }
      //     });
      //   },
      //   textBoxes: [
      //     {
      //       text: 'Your fresh footsoldier took the hit, protecting the injured one !',
      //       canGoNext: true
      //     },
      //     {
      //       text: "It's your turn again. Let's try to attack the enemy Hero directly!",
      //       canGoNext: true
      //     },
      //     {
      //       text: 'Minions in the Defense Zone cannot declare attacks.',
      //       canGoNext: true
      //     },
      //     {
      //       text: 'Select your footsoldier in the Attack Zone and declare attack.',
      //       canGoNext: false,
      //       onEnter(game, client, next) {
      //         client.ui.highlightedElement =
      //           client.ui.DOMSelectors.minionSprite('p1', 'attack', 2).element;
      //         client.ui.DOMSelectors.minionClickableArea(
      //           'p1',
      //           'attack',
      //           2
      //         ).element!.addEventListener('click', next, {
      //           once: true
      //         });
      //       }
      //     }
      //   ]
      // },
      // turn2_declare_target: {
      //   id: 'turn2_declare_target',
      //   isRoot: false,
      //   validate: simpleStepValidation(
      //     () =>
      //       z.object({
      //         type: z.literal('declareAttackTarget'),
      //         payload: z.object({
      //           playerId: z.literal('p1'),
      //           targetId: z.literal(meta.enemyHero!.id)
      //         })
      //       }),
      //     'Click the enemy hero to attack it.'
      //   ),
      //   next: () => 'turn_2_second_attack',
      //   textBoxes: [
      //     {
      //       text: 'Click on the enemy Hero to attack it.',
      //       canGoNext: false,
      //       onEnter(game, client) {
      //         client.ui.highlightedElement =
      //           client.ui.DOMSelectors.heroSprite('p2').element;
      //       },
      //       onLeave(game, client) {
      //         client.ui.highlightedElement = null;
      //       }
      //     }
      //   ]
      // },
      // turn_2_second_attack: {
      //   id: 'turn_2_second_attack',
      //   isRoot: false,
      //   validate: simpleStepValidation(
      //     () =>
      //       z.object({
      //         type: z.literal('declareAttack'),
      //         payload: z.object({
      //           playerId: z.literal('p1'),
      //           attackerId: z.literal(meta.allyHero!.id)
      //         })
      //       }),
      //     'Declare an attack with your hero.'
      //   ),
      //   next: () => 'final_attack',
      //   async onEnter(game) {
      //     game.dispatch({
      //       type: 'declareBlocker',
      //       payload: {
      //         playerId: 'p2',
      //         blockerId: meta.enemySlime3!.id
      //       }
      //     });
      //   },
      //   textBoxes: [
      //     {
      //       text: 'The enemy slime is blocking your attack!',
      //       canGoNext: true,
      //       async onLeave(game, client) {
      //         game.dispatch({
      //           type: 'passChain',
      //           payload: {
      //             playerId: 'p2'
      //           }
      //         });
      //         await client.waitUntil(
      //           state => state.effectChain?.player === 'p1'
      //         );
      //         game.dispatch({
      //           type: 'passChain',
      //           payload: {
      //             playerId: 'p1'
      //           }
      //         });
      //       }
      //     },
      //     {
      //       text: 'Even though the slime survived the attack, it cannot block anymore this turn.',
      //       canGoNext: true
      //     },
      //     {
      //       text: "The enemy hero is wide open, let's finish this !",
      //       canGoNext: true
      //     },
      //     {
      //       text: "I'm going to help you and increase your Hero's attack.",
      //       canGoNext: true,
      //       onLeave(game) {
      //         meta.allyHero?.addInterceptor('atk', () => 5);
      //         game.snapshotSystem.takeSnapshot();
      //       }
      //     },
      //     {
      //       text: 'Select your Hero and click the attack button.',
      //       canGoNext: false,
      //       onEnter(game, client) {
      //         client.ui.highlightedElement =
      //           client.ui.DOMSelectors.heroSprite('p1').element;
      //       },
      //       onLeave(game, client) {
      //         client.ui.highlightedElement = null;
      //       }
      //     }
      //   ]
      // },
      // final_attack: {
      //   id: 'final_attack',
      //   isRoot: false,
      //   validate: simpleStepValidation(
      //     () =>
      //       z.object({
      //         type: z.literal('declareAttackTarget'),
      //         payload: z.object({
      //           playerId: z.literal('p1'),
      //           targetId: z.literal(meta.enemyHero!.id)
      //         })
      //       }),
      //     'Click the enemy hero to attack it.'
      //   ),
      //   next: () => 'end',
      //   textBoxes: [
      //     {
      //       text: "Let's finish this! Click the enemy hero !",
      //       canGoNext: false
      //     }
      //   ]
      // },
      // end: {
      //   id: 'end',
      //   isRoot: false,
      //   validate: () => {
      //     return { status: 'success' };
      //   },
      //   next: () => null,
      //   async onEnter(game, step, client) {
      //     game.dispatch({
      //       type: 'declareBlocker',
      //       payload: {
      //         playerId: 'p2',
      //         blockerId: null
      //       }
      //     });
      //     await client.waitUntil(state => isDefined(state.effectChain));
      //     game.dispatch({
      //       type: 'passChain',
      //       payload: {
      //         playerId: 'p2'
      //       }
      //     });
      //     await client.waitUntil(state => state.effectChain?.player === 'p1');
      //     game.dispatch({
      //       type: 'passChain',
      //       payload: {
      //         playerId: 'p1'
      //       }
      //     });
      //   },
      //   textBoxes: [
      //     {
      //       text: "You did it ! You've completed the tutorial !",
      //       canGoNext: false
      //     }
      //   ]
      // }
    }
  }
};
