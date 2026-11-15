import dedent from 'dedent';
import type { MinionBlueprint } from '../../../card-blueprint';
import { defaultCardArt } from '../../../card-utils';
import { CARD_SETS, CARD_KINDS, RARITIES, CARD_SPEED } from '../../../card.enums';
import { FACTION_IDS } from '../../../factions/factions';

export const bloodboundExecutor: MinionBlueprint = {
  id: 'bloodbound-executor',
  name: 'Bloodbound Executor',
  description: dedent /*html*/ ` `,
  collectable: false,
  setId: CARD_SETS.TUTORIAL,
  art: defaultCardArt('minions/bloodbound-executor'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.TOKEN,
  manaCost: 3,
  manaSupply: 2,
  level: 1,
  exp: 1,
  factionId: FACTION_IDS.NEUTRAL,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 4,
  maxHp: 2,
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
