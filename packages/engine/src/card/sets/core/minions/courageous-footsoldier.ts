import { LingeringDestinyModifier } from '../../../../modifier/modifiers/lingering-destiny.modifier';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';

export const courageousFootsoldier: MinionBlueprint = {
  id: 'courageous-footsoldier',
  name: 'Courageous Footsoldier',
  cardIconId: 'minions/courageous-footsoldier',
  description: `@Lingering Destiny@`,
  collectable: true,
  unique: false,
  manaCost: 1,
  speed: CARD_SPEED.SLOW,
  atk: 2,
  maxHp: 2,
  rarity: RARITIES.COMMON,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  job: null,
  spellSchool: null,
  setId: CARD_SETS.CORE,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(new LingeringDestinyModifier(game, card));
  },
  async onPlay() {}
};
