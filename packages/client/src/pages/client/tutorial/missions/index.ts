import type { UseTutorialOptions } from '../useTutorial';
import { chainTutorial } from './card-chains';
import { combatTutorial } from './combat';
import { destinyCardsTutorial } from './destiny-cards';
import { playCardTutorial } from './play-cards';

export type TutorialMission = {
  id: string;
  name: string;
  options: UseTutorialOptions;
};

export const missions = [
  playCardTutorial,
  combatTutorial,
  chainTutorial,
  destinyCardsTutorial
];
