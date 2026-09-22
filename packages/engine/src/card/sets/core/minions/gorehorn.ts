import dedent from 'dedent';
import type { MinionBlueprint } from '../../../card-blueprint';
import { defaultCardArt } from '../../../card-utils';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  CARD_SPEED,
  AFFINITIES
} from '../../../card.enums';
import { OverwhelmModifier } from '../../../../modifier/modifiers/overwhelm.modifier';
import { SimpleStatsBuffModifier } from '../../../../modifier/modifiers/simple-stats-modifier';
import { AffinitiesTogglableModifierMixin } from '../../../../modifier/mixins/togglable.mixin';

export const gorehorn: MinionBlueprint = {
  id: 'gorehorn',
  name: 'Gorehorn',
  description: dedent /*html*/ `
  <rt-keyword>Overwhelm</rt-keyword>.
  <rt-affinity affinities="Songhai,Songhai,Songhai"></rt-affinity> I have +0/+1/+1.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('minions/gorehorn'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  affinities: [AFFINITIES.FIRE],
  manaCost: 4,
  manaSupply: 2,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 4,
  maxHp: 3,
  commandment: 2,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(new OverwhelmModifier(game, card));
    await card.modifiers.add(
      new SimpleStatsBuffModifier('gorehorn-self-buff', game, card, {
        atk: 1,
        hp: 1,
        cmd: 0,
        mixins: [
          new AffinitiesTogglableModifierMixin(game, [
            AFFINITIES.FIRE,
            AFFINITIES.FIRE,
            AFFINITIES.FIRE
          ])
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
