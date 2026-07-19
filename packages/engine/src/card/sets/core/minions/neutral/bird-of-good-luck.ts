import dedent from 'dedent';
import type { MinionBlueprint } from '../../../../card-blueprint';
import { defaultCardArt } from '../../../../card-utils';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  AFFINITIES,
  CARD_SPEED
} from '../../../../card.enums';
import { RuneCostToggleModifierMixin } from '../../../../../modifier/mixins/togglable.mixin';
import { FlankingModifier } from '../../../../../modifier/modifiers/flanking.modifier';
import { OnEnterModifier } from '../../../../../modifier/modifiers/on-enter.modifier';
import { EchoModifier } from '../../../../../modifier/modifiers/echo.modifier';
import { AttackerModifier } from '../../../../../modifier/modifiers/attacker.modifier';
import { predict } from '../../../../card-actions-utils';
import { SimpleCommandmentBuffModifier } from '../../../../../modifier/modifiers/simple-commandment-modifier';

export const birdOfGoodLuck: MinionBlueprint = {
  id: 'birdOfGoodLuck',
  name: 'Bird of Good Luck',
  description: dedent /*html*/ `
  <rt-runes runes="wisdom"></rt-runes><rt-trigger>On Enter</rt-trigger> <rt-keyword>Predict</rt-keyword>.
  <rt-runes runes="focus"></rt-runes> <rt-keyword>Flanking</rt-keyword>
  <br/>
  <rt-runes runes="resonance"></rt-runes> +1/+0/+0
  <rt-runes runes="might"></rt-runes> <rt-keyword>Attacker 1</rt-keyword>
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.EPIC,
  jobs: [],
  affinities: [AFFINITIES.NEUTRAL],
  manaCost: 2,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 1,
  maxHp: 3,
  commandment: 1,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new FlankingModifier(game, card, {
        amount: 1,
        mixins: [
          new RuneCostToggleModifierMixin(game, card, {
            focus: 1
          })
        ]
      })
    );

    await card.modifiers.add(
      new OnEnterModifier(game, card, {
        async handler() {
          await predict(game, card);
        },
        mixins: [
          new RuneCostToggleModifierMixin(game, card, {
            wisdom: 1
          })
        ]
      })
    );

    await card.modifiers.add(
      new SimpleCommandmentBuffModifier('bird-of-good-luck-cmd-buff', game, card, {
        amount: 1,
        mixins: [
          new RuneCostToggleModifierMixin(game, card, {
            resonance: 1
          })
        ]
      })
    );

    await card.modifiers.add(
      new AttackerModifier(game, card, {
        amount: 1,
        mixins: [
          new RuneCostToggleModifierMixin(game, card, {
            might: 1
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
