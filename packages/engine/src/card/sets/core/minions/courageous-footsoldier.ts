import { AttackerModifier } from '../../../../modifier/modifiers/attacker.modifier';
import { SimpleAttackBuffModifier } from '../../../../modifier/modifiers/simple-attack-buff.modifier';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';

export const courageousFootsoldier: MinionBlueprint = {
  id: 'courageous-footsoldier',
  name: 'Courageous Footsoldier',
  cardIconId: 'flamefist-fighter',
  description: ``,
  collectable: true,
  unique: false,
  manaCost: 2,
  atk: 2,
  maxHp: 2,
  rarity: RARITIES.COMMON,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  affinity: AFFINITIES.NORMAL,
  setId: CARD_SETS.CORE,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {},
  async onPlay() {}
};
