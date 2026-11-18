import dedent from 'dedent';
import type { MinionBlueprint } from '../../../card-blueprint';
import { defaultCardArt } from '../../../card-utils';
import { CARD_SETS, CARD_KINDS, RARITIES, CARD_SPEED } from '../../../card.enums';
import { OverwhelmModifier } from '../../../../modifier/modifiers/overwhelm.modifier';
import { FACTION_IDS } from '../../../factions/factions';
import { SimpleStatsBuffModifier } from '../../../../modifier/modifiers/simple-stats-modifier';
import { LevelTogglableModifierMixin } from '../../../../modifier/mixins/togglable.mixin';

export const gorehorn: MinionBlueprint = {
  id: 'gorehorn',
  name: 'Gorehorn',
  description: dedent /*html*/ `
  <rt-keyword>Overwhelm</rt-keyword>.
  <rt-level-bonus level="3"></rt-level-bonus> +0/+0/+2.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('minions/gorehorn'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  manaCost: 3,
  manaSupply: 2,
  level: 1,
  exp: 1,
  factionId: FACTION_IDS.SONGHAI,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 4,
  maxHp: 2,
  commandment: 2,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(new OverwhelmModifier(game, card));
    await card.modifiers.add(
      new SimpleStatsBuffModifier('gorehorn-buff', game, card, {
        cmd: 0,
        atk: 1,
        hp: 2,
        mixins: [new LevelTogglableModifierMixin(game, 3)]
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
