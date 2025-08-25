import type { TutorialMission } from '.';
import type { HeroCard } from '@game/engine/src/card/entities/hero.entity';

const meta: {
  allyHero: HeroCard | null;
  enemyHero: HeroCard | null;
} = {
  allyHero: null,
  enemyHero: null
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
      PLAYER_2_CARDS_DRAWN_ON_FIRST_TURN: 0,
      SHUFFLE_DECK_ON_GAME_START: false
    },
    async setup(game, client) {
      client.ui.displayedElements.artifacts = false;
      client.ui.displayedElements.destinyPhaseModal = false;
      client.ui.displayedElements.phaseTracker = false;

      meta.allyHero = game.playerSystem.player1.hero;
      meta.allyHero.abilities.splice(0, -1);
      meta.enemyHero = game.playerSystem.player2.hero;
    },
    steps: {
      root: {
        id: 'root',
        isRoot: true,
        validate() {
          return { status: 'success' };
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
