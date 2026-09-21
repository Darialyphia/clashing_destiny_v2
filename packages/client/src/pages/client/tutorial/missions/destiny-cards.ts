import type { TutorialMission } from '.';

export const destinyCardsTutorial: TutorialMission = {
  id: 'play-card',
  name: 'Mission 4 : Destiny Cards',
  options: {
    players: [
      {
        id: 'p1',
        name: 'You',
        deck: {
          cards: Array.from({ length: 30 }, () => ({
            blueprintId: 'courageous-footsoldier',
            isFoil: false
          }))
        }
      },
      {
        id: 'p2',
        name: 'Opponent',
        deck: {
          cards: Array.from({ length: 30 }, () => ({
            blueprintId: 'courageous-footsoldier',
            isFoil: false
          }))
        }
      }
    ],
    rngSeed: 'tutorial-seed',
    history: [],
    config: {
      SHUFFLE_DECK_ON_GAME_START: false
    },
    async setup() {
      // client.ui.displayedElements.artifacts = false;
      // client.ui.displayedElements.destinyPhaseModal = false;
      // client.ui.displayedElements.phaseTracker = false;
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
            text: 'Just play the mfkn game',
            canGoNext: true,
            top: '25%',
            left: '50%',
            centered: { x: true }
          }
        ]
      }
    }
  }
};
