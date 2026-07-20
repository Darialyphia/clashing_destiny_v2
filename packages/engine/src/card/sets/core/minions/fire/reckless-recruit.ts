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
import { RushModifier } from '../../../../../modifier/modifiers/rush.modifier';
import { AttackerModifier } from '../../../../../modifier/modifiers/attacker.modifier';

export const recklessRecruit: MinionBlueprint = {
  id: 'recklessRecruit',
  name: 'Reckless Recruit',
  description: dedent /*html*/ `
  <rt-keyword>Rush 1</rt-keyword> <rt-keyword><rt-runes runes="might,might,might"></rt-runes> Attacker 2</rt-keyword>
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('minions/reckless-recruit'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  jobs: [JOBS.WARRIOR],
  affinities: [AFFINITIES.FIRE],
  manaCost: 2,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 1,
  maxHp: 3,
  commandment: 2,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(new RushModifier(game, card, { cost: 1 }));
    await card.modifiers.add(
      new AttackerModifier(game, card, {
        amount: 2,
        mixins: [
          new RuneCostToggleModifierMixin(game, card, {
            might: 3
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
