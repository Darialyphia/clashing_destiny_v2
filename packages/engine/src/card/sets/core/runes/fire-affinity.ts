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

export const fireAffinity: RuneBlueprint = {
  id: 'fire-affinity',
  kind: CARD_KINDS.RUNE,
  collectable: true,
  name: 'Songhai Affinity',
  description: dedent /*html*/ `Provides one songhai Affinity.`,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  art: defaultCardArt('affinities/fire-affinity'),
  speed: CARD_SPEED.SLOW,
  affinities: [AFFINITIES.FIRE],
  tags: [],
  async onInit() {},
  async onPlay() {}
};
