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

export const radiantCelestial: MinionBlueprint = {
  id: 'radiant-celestial',
  name: 'Radiant Celestial',
  cardIconId: 'minions/radiant-celestial',
  description: dedent`
  You need to pay an additional @[mana] 2@ to play this card.
  @Hero Intercept@.
  @On Enter@ and @On Attack@: Heal your hero and all allied minions for 4.
  `,
  collectable: true,
  unique: false,
  destinyCost: 3,
  speed: CARD_SPEED.FAST,
  atk: 3,
  maxHp: 8,
  rarity: RARITIES.LEGENDARY,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  kind: CARD_KINDS.MINION,
  job: null,
  spellSchool: SPELL_SCHOOLS.LIGHT,
  setId: CARD_SETS.CORE,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit() {},
  async onPlay() {}
};
