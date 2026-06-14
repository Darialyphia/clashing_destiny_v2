import dedent from 'dedent';
import {
  JobBonusToggleModifierMixin,
  RuneCostToggleModifierMixin
} from '../../../../../modifier/mixins/togglable.mixin';
import { SimpleManacostModifier } from '../../../../../modifier/modifiers/simple-manacost-modifier';
import { SpellDamage } from '../../../../../utils/damage';
import type { SpellBlueprint } from '../../../../card-blueprint';
import { anywhereTargetRules, defaultCardArt } from '../../../../card-utils';
import {
  JOBS,
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  AFFINITIES,
  CARD_SPEED
} from '../../../../card.enums';
import { BurstModifier } from '../../../../../modifier/modifiers/burst.modifier';
import { predict } from '../../../../card-actions-utils';

export const arcaneSight: SpellBlueprint = {
  id: 'arcaneSight',
  name: 'Arcane Sight',
  description: dedent /*html*/ `
    <rt-keyword>Burst</rt-keyword> <rt-keyword>Predict</rt-keyword>
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.COMMON,
  jobs: [JOBS.MAGE],
  affinities: [AFFINITIES.ARCANE],
  manaCost: 1,
  speed: CARD_SPEED.FAST,
  tags: [],
  canPlay: () => true,
  getTargets: (game, card) => anywhereTargetRules.getTargets({ game, card }),
  async onInit(game, card) {
    await card.modifiers.add(new BurstModifier(game, card));
  },
  async onPlay(game, card) {
    await predict(game, card);
  },
  aiHints: {
    shouldPlay: () => 1
  }
};
