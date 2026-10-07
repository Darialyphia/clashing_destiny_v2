import type { UseTutorialOptions } from '../client/tutorial/useTutorial';
import { basicsTutorial } from './basics';

export type TutorialMission = {
  id: string;
  name: string;
  options: UseTutorialOptions;
};

export const missions = [basicsTutorial];
