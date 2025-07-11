import { DoubleAttackModifier } from '../../../../modifier/modifiers/double-attack.modifier';
import { RushModifier } from '../../../../modifier/modifiers/rush.modifier';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';

export const hotHeadedRecruit: MinionBlueprint = {
  id: 'hot-headed-recruit',
  name: 'Hot-Headed Recruit',
  cardIconId: 'unit-hot-blooded-recruit',
  description: `@Double Attack@.`,
  collectable: true,
  unique: false,
  manaCost: 2,
  atk: 1,
  maxHp: 1,
  rarity: RARITIES.COMMON,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  affinity: AFFINITIES.FIRE,
  setId: CARD_SETS.CORE,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(new DoubleAttackModifier(game, card));
  },
  async onPlay() {}
};
