import type { UseTutorialOptions } from '../client/tutorial/useTutorial';
import { basicsTutorial } from './basics';
import { resourcesTutorial } from './resources';
import { artifactsSecretsTutorial } from './artifacts-secrets';
import { locationsTutorial } from './locations';

export type TutorialMission = {
  id: string;
  name: string;
  options: UseTutorialOptions;
};

export const missions = [
  basicsTutorial,
  resourcesTutorial,
  artifactsSecretsTutorial,
  locationsTutorial
];
