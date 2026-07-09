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
