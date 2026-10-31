import type { UseTutorialOptions } from '../client/tutorial/useTutorial';
import { basicsTutorial } from './basics';
import { resourcesTutorial } from './resources';
import { artifactsSecretsTutorial } from './artifacts-secrets';
import { locationsTutorial } from './locations';

export type TutorialMission = {
  id: string;
  name: string;
  options: UseTutorialOptions;
  // id of the mission offered to the player once this one is won
  nextMission?: string;
};

export const missions = [
  basicsTutorial,
  resourcesTutorial,
  artifactsSecretsTutorial,
  locationsTutorial
];
