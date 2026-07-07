import dedent from 'dedent';
import { InstantModifier } from '../../../../../modifier/modifiers/instant.modifier';
import { scry } from '../../../../card-actions-utils';
import type { ArtifactBlueprint } from '../../../../card-blueprint';
import { defaultCardArt, anywhereTargetRules } from '../../../../card-utils';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  JOBS,
  AFFINITIES,
  CARD_SPEED
} from '../../../../card.enums';

export const runicCatalyst: ArtifactBlueprint = {
  id: 'runicCatalyst',
  name: 'Runic Catalyst',
  description: dedent /*html*/ `
    Whenever you consume a rune, you may gain 1 influence on a battlefield. If you do, this loses 1 durability.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.ARTIFACT,
  rarity: RARITIES.COMMON,
  jobs: [JOBS.ACOLYTE],
  affinities: [AFFINITIES.ARCANE],
  manaCost: 2,
  durability: 2,
  speed: CARD_SPEED.SLOW,
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(new InstantModifier(game, card));
  },
  async onPlay(game, card) {},
  aiHints: {
    shouldPlay: () => 1
  }
};
