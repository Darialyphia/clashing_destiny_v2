import type { UseTutorialOptions } from '../useTutorial';
import { combatTutorial } from './combat';
import { playCardTutorial } from './play-cards';

export type TutorialMission = {
  id: string;
  name: string;
  options: UseTutorialOptions;
};

export const missions = [playCardTutorial, combatTutorial];
