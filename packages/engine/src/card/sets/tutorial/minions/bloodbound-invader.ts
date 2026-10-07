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
import { SimpleAttackBuffModifier } from '../../../../modifier/modifiers/simple-attack-buff.modifier';
import { ZealModifier } from '../../../../modifier/modifiers/zeal.modifier';

export const bloodboundInvader: MinionBlueprint = {
  id: 'bloodbound-invader',
  name: 'Bloodbound Invader',
  description: dedent /*html*/ ` `,
  collectable: false,
  setId: CARD_SETS.TUTORIAL,
  art: defaultCardArt('minions/bloodbound-invader'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.TOKEN,
  manaCost: 0,
  manaSupply: 2,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 1,
  maxHp: 2,
  affinities: [],
  commandment: 2,
  canPlay: () => true,
  abilities: [],
  async onInit() {},
  async onPlay() {},
  aiHints: {
    shouldPlay: () => 1,
    shouldAttack: () => 1,
    shouldMove: () => 1,
    getThreatScore: () => 1
  }
};
