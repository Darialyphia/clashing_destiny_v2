import dedent from 'dedent';
import type { RuneBlueprint } from '../../../card-blueprint';
import { defaultCardArt } from '../../../card-utils';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  AFFINITIES,
  CARD_SPEED
} from '../../../card.enums';

export const lightAffinity: RuneBlueprint = {
  id: 'light-affinity',
  kind: CARD_KINDS.RUNE,
  collectable: true,
  name: 'Light Affinity',
  description: dedent /*html*/ ``,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  art: defaultCardArt('placeholder'),
  speed: CARD_SPEED.SLOW,
  affinities: [AFFINITIES.LIGHT],
  tags: [],
  async onInit() {},
  async onPlay() {}
};
