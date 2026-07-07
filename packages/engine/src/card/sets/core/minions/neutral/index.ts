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

export const braveCitizen: MinionBlueprint = {
  id: 'braveCitizen',
  name: 'Brave Citizen',
  description: dedent /*html*/ `
  <rt-keyword><rt-runes runes="might">.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  jobs: [],
  affinities: [AFFINITIES.NEUTRAL],
  manaCost: 2,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 2,
  maxHp: 2,
  commandment: 2,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {},
  async onPlay() {},
  aiHints: {
    shouldPlay: () => 1,
    shouldAttack: () => 1,
    shouldMove: () => 1,
    getThreatScore: () => 1
  }
};

export const birdOfGoodLuck: MinionBlueprint = {
  id: 'birdOfGoodLuck',
  name: 'Bird of Good Luck',
  description: dedent /*html*/ `
  <rt-runes runes="wisdom"></rt-runes><rt-trigger>On Enter</rt-trigger> Draw a card.
  <rt-runes runes="focus"></rt-runes> <rt-keyword>Flanking</rt-keyword>
  <br/>
  <rt-runes runes="resonance"></rt-runes> <rt-keyword>Echo</rt-keyword>
  <br/>
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
  commandment: 2,
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
          await card.player.cardManager.draw(1);
        },
        mixins: [
          new RuneCostToggleModifierMixin(game, card, {
            wisdom: 1
          })
        ]
      })
    );

    await card.modifiers.add(
      new EchoModifier(game, card, {
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
