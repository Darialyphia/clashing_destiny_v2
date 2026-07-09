import dedent from 'dedent';
import { RuneCostToggleModifierMixin } from '../../../../../modifier/mixins/togglable.mixin';
import type { MinionBlueprint } from '../../../../card-blueprint';
import { defaultCardArt } from '../../../../card-utils';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  JOBS,
  AFFINITIES,
  CARD_SPEED
} from '../../../../card.enums';
import { TauntModifier } from '../../../../../modifier/modifiers/taunt.modifier';
import { SimpleManacostModifier } from '../../../../../modifier/modifiers/simple-manacost-modifier';

export const mountainProtector: MinionBlueprint = {
  id: 'mountainProtector',
  name: 'Mountain Protector',
  description: dedent /*html*/ `
  <rt-keyword>Taunt</rt-keyword>
  <br/>
  <rt-runes runes="might,might,focus"></rt-runes> This costs 1 less.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  jobs: [JOBS.WARRIOR],
  affinities: [AFFINITIES.EARTH],
  manaCost: 4,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 2,
  maxHp: 5,
  commandment: 2,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(new TauntModifier(game, card));
    await card.modifiers.add(
      new SimpleManacostModifier('mountain-protector', game, card, {
        amount: -1,
        mixins: [
          new RuneCostToggleModifierMixin(game, card, {
            might: 2,
            focus: 1
          })
        ]
      })
    );
  },
  async onPlay() {},
  aiHints: {
    shouldPlay: () => 1,
    shouldAttack: () => 1,
    shouldMove: () => 1,
    getThreatScore: () => 1
  }
};
