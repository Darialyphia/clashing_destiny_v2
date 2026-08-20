import dedent from 'dedent';
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
import { AttackerModifier } from '../../../../../modifier/modifiers/attacker.modifier';
import { DoubleAttackModifier } from '../../../../../modifier/modifiers/double-attack.modifier';

export const recklessRecruit: MinionBlueprint = {
  id: 'recklessRecruit',
  name: 'Reckless Recruit',
  description: dedent /*html*/ `
  <rt-keyword>Attacker 2</rt-keyword>
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('minions/reckless-recruit'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  jobs: [JOBS.WARRIOR],
  affinities: [AFFINITIES.FIRE],
  manaCost: 2,
  manaSupply: 2,
  speed: CARD_SPEED.SLOW,
  tags: [],
  statRequirements: {
    might: 2,
    focus: 0,
    wisdom: 0
  },
  atk: 1,
  maxHp: 3,
  commandment: 1,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(new DoubleAttackModifier(game, card));
    await card.modifiers.add(
      new AttackerModifier(game, card, {
        amount: 2
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
