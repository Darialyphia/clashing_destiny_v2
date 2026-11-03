import dedent from 'dedent';
import type { LocationBlueprint } from '../../../card-blueprint';
import { defaultCardArt } from '../../../card-utils';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  AFFINITIES,
  CARD_SPEED
} from '../../../card.enums';

export const tutorialSilverguardOutpost: LocationBlueprint = {
  id: 'tutorial-silverguard-outpost',
  kind: CARD_KINDS.LOCATION,
  collectable: true,
  name: 'Silverguard Outpost',
  description: dedent /*html*/ `
  `,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.RARE,
  art: defaultCardArt('locations/silverguard-outpost'),
  speed: CARD_SPEED.SLOW,
  affinities: [AFFINITIES.NEUTRAL],
  tags: [],
  async onInit() {},
  async onPlay() {}
};
