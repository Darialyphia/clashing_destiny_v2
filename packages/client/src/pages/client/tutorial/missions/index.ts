import type { UseTutorialOptions } from '../useTutorial';
import { basicsTutorial } from './basics';

export type TutorialMission = {
  id: string;
  name: string;
  options: UseTutorialOptions;
};

export const missions = [basicsTutorial];
