import type { UseTutorialOptions } from '../useTutorial';
import { combatTutorial } from './combat';

export type TutorialMission = {
  id: string;
  name: string;
  options: UseTutorialOptions;
};

export const missions = [combatTutorial];
