import dedent from 'dedent';
import type { MinionBlueprint } from '../../../card-blueprint';
import { defaultCardArt } from '../../../card-utils';
import { CARD_SETS, CARD_KINDS, RARITIES, CARD_SPEED } from '../../../card.enums';
import { FlankingModifier } from '../../../../modifier/modifiers/flanking.modifier';
import { FACTION_IDS } from '../../../factions/factions';

export const tutorialAzuriteLion: MinionBlueprint = {
  id: 'tutorial-azurite-lion',
  name: 'Azurite Lion',
  description: dedent /*html*/ `
  <rt-keyword>Flanking</rt-keyword>.
  `,
  collectable: false,
  setId: CARD_SETS.TUTORIAL,
  art: defaultCardArt('minions/azurite-lion'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.TOKEN,
  manaCost: 3,
  manaSupply: 2,
  level: 1,
  exp: 1,
  factionId: FACTION_IDS.LYONAR,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 2,
  maxHp: 4,
  commandment: 2,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(new FlankingModifier(game, card));
  },
  async onPlay() {},
  aiHints: {
    shouldPlay: () => 1,
    shouldAttack: () => 1,
    shouldMove: () => 1,
    getThreatScore: () => 1
  }
};
