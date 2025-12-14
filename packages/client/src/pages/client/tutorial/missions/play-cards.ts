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
  name: 'Mission 1 : Playing Cards',
  options: {
    players: [
      {
        id: 'p1',
        name: 'You',
        mainDeck: {
          cards: Array.from({ length: 30 }, () => 'courageous-footsoldier')
        },
        destinyDeck: {
          cards: ['aiden-lv1']
        }
      },
      {
        id: 'p2',
        name: 'Opponent',
        mainDeck: {
          cards: Array.from({ length: 30 }, () => 'courageous-footsoldier')
        },
        destinyDeck: {
          cards: ['aiden-lv1']
        }
      }
    ],
    rngSeed: 'tutorial-seed',
    history: [],
    config: {
      SHUFFLE_DECK_ON_GAME_START: false
    },
    async setup(game) {
      // client.ui.displayedElements.artifacts = false;
      // client.ui.displayedElements.destinyPhaseModal = false;
      // client.ui.displayedElements.phaseTracker = false;

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
            text: 'Welcome to the Clashing Destinies tutorial!',
            canGoNext: true,
            top: '25%',
            left: '50%',
            centered: { x: true }
          },
          {
            text: "The goal of the game is to reduce your opponent's hero health to 0.",
            canGoNext: true,
            top: '25%',
            left: '50%',
            centered: { x: true },
            onEnter(game, client) {
              client.ui.highlightedElement =
                client.ui.DOMSelectors.heroHealthIndicator('p2').element;
            }
          }
        ]
      }
    }
  }
};
