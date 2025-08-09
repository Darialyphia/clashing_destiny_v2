import type { HeroBlueprint } from '../../../card-blueprint';
import { isArtifact, sealAbility } from '../../../card-utils';
import {
  AFFINITIES,
  ARTIFACT_KINDS,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';

export const combatTutorialEnemyHero: HeroBlueprint = {
  id: 'combat-tutorial-enemy-hero',
  name: 'King Slime',
  description: '',
  cardIconId: 'hero-slime-king',
  kind: CARD_KINDS.HERO,
  affinity: AFFINITIES.NORMAL,
  affinities: [],
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  collectable: false,
  unique: false,
  lineage: null,
  spellPower: 0,
  atk: 0,
  maxHp: 5,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  abilities: [],
  tags: [],
  async onInit() {},
  async onPlay() {}
};
