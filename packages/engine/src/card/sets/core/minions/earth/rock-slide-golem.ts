import dedent from 'dedent';
import { RuneCostToggleModifierMixin } from '../../../../../modifier/mixins/togglable.mixin';
import type { MinionBlueprint } from '../../../../card-blueprint';
import { defaultCardArt } from '../../../../card-utils';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  AFFINITIES,
  CARD_SPEED
} from '../../../../card.enums';
import { TauntModifier } from '../../../../../modifier/modifiers/taunt.modifier';
import { FlankingModifier } from '../../../../../modifier/modifiers/flanking.modifier';
import { SimpleCommandmentBuffModifier } from '../../../../../modifier/modifiers/simple-commandment-modifier';

export const rockSlideGolem: MinionBlueprint = {
  id: 'rockslideGolem',
  name: 'Rockslide Golem',
  description: dedent /*html*/ `
  <rt-keyword>Taunt</rt-keyword> <rt-keyword>Flanking</rt-keyword>
  <br/>
  <rt-runes runes="might,might,focus"></rt-runes> +1 Commandment
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  jobs: [],
  affinities: [AFFINITIES.EARTH],
  manaCost: 3,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 1,
  maxHp: 4,
  commandment: 1,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(new TauntModifier(game, card));
    await card.modifiers.add(
      new FlankingModifier(game, card, {
        amount: 1
      })
    );

    await card.modifiers.add(
      new SimpleCommandmentBuffModifier('rockslide-golem-cmd-buff', game, card, {
        amount: 1,
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
