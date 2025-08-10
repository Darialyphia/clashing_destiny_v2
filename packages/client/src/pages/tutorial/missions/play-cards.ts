import type { MinionCard } from '@game/engine/src/card/entities/minion.entity';
import type { TutorialMission } from '.';
import { z } from 'zod';
import type { HeroCard } from '@game/engine/src/card/entities/hero.entity';

const meta: {
  allyHero: HeroCard | null;
  allyfootSoldier1: MinionCard | null;
  allyfootSoldier2: MinionCard | null;
  enemyHero: HeroCard | null;
  enemySlime1: MinionCard | null;
  enemySlime2: MinionCard | null;
  enemySlime3: MinionCard | null;
} = {
  allyHero: null,
  allyfootSoldier1: null,
  allyfootSoldier2: null,
  enemyHero: null,
  enemySlime1: null,
  enemySlime2: null,
  enemySlime3: null
};

export const playCardTutorial: TutorialMission = {
  id: 'play-card',
  name: 'Mission 2 : Playing Cards',
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
        hero: 'combat-tutorial-enemy-hero',
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
    async setup(game, client) {
      client.ui.displayedElements.artifacts = false;
      client.ui.displayedElements.destinyPhaseModal = false;
      client.ui.displayedElements.phaseTracker = false;

      meta.allyHero = game.playerSystem.player1.hero;
      meta.allyHero.addInterceptor('abilities', () => []);
      meta.enemyHero = game.playerSystem.player2.hero;
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
                attackerId: z.literal(meta.allyfootSoldier1!.id)
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
        next: () => null,
        textBoxes: [
          {
            text: 'TODO',
            canGoNext: true
          }
        ]
      }
    }
  }
};
