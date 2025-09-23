import type { HeroBlueprint } from '../../../card-blueprint';
import {
  SPELL_SCHOOLS,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  HERO_JOBS,
  RARITIES
} from '../../../card.enums';

export const combatTutorialEnemyHero: HeroBlueprint = {
  id: 'combat-tutorial-enemy-hero',
  name: 'King Slime',
  description: '',
  level: 1,
  cardIconId: 'hero-slime-king',
  destinyCost: 0,
  speed: CARD_SPEED.SLOW,
  canPlay: () => true,
  kind: CARD_KINDS.HERO,
  jobs: [HERO_JOBS.WARRIOR],
  spellSchools: [],
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
