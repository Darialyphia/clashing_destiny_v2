import { PiercingModifier } from '../../../../modifier/modifiers/percing.modifier';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';

export const sunPalaceGuard: MinionBlueprint = {
  id: 'sun-palace-guard',
  name: 'Sun Palace Guard',
  cardIconId: 'unit-sun-palace-guard',
  description: `@Piercing@.`,
  collectable: true,
  unique: false,
  manaCost: 2,
  atk: 1,
  maxHp: 2,
  rarity: RARITIES.COMMON,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  affinity: AFFINITIES.NORMAL,
  setId: CARD_SETS.CORE,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(new PiercingModifier(game, card));
  },
  async onPlay() {}
};
