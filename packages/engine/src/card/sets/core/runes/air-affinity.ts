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

export const airAffinity: RuneBlueprint = {
  id: 'air-affinity',
  kind: CARD_KINDS.RUNE,
  collectable: true,
  name: 'Vetruvian Affinity',
  description: dedent /*html*/ `Provides one Vetruvian Affinity.`,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  art: defaultCardArt('affinities/air-affinity'),
  speed: CARD_SPEED.SLOW,
  affinities: [AFFINITIES.AIR],
  tags: [],
  async onInit() {},
  async onPlay() {}
};
