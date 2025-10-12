import dedent from 'dedent';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES,
  SPELL_SCHOOLS
} from '../../../card.enums';

export const cosmicAvatar: MinionBlueprint = {
  id: 'cosmic-avatar',
  name: 'Cosmic Avatar',
  cardIconId: 'minions/cosmic-avatar',
  description: dedent`
  @Piercing@, @Overwhelm@.
  When this deals damage to the enemy Hero, add that many @Mana Spark@ to your hand.
  `,
  collectable: true,
  unique: false,
  destinyCost: 3,
  speed: CARD_SPEED.SLOW,
  atk: 4,
  maxHp: 5,
  rarity: RARITIES.LEGENDARY,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  kind: CARD_KINDS.MINION,
  job: null,
  spellSchool: SPELL_SCHOOLS.ARCANE,
  setId: CARD_SETS.CORE,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit() {},
  async onPlay() {}
};
