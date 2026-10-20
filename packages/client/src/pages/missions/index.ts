import type { UseTutorialOptions } from '../client/tutorial/useTutorial';
import { basicsTutorial } from './basics';
import { resourcesTutorial } from './resources';

export type TutorialMission = {
  id: string;
  name: string;
  options: UseTutorialOptions;
};

export const missions = [basicsTutorial, resourcesTutorial];
