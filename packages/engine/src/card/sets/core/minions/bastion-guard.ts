import { DefenderModifier } from '../../../../modifier/modifiers/defender.modifier';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';

export const bastionGuard: MinionBlueprint = {
  id: 'bastion-guard',
  name: 'Bastion Guard',
  cardIconId: 'minions/bastion-guard',
  description: `@Defender (2)@`,
  collectable: true,
  unique: false,
  manaCost: 3,
  speed: CARD_SPEED.SLOW,
  atk: 1,
  maxHp: 5,
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
    await card.modifiers.add(new DefenderModifier(game, card, { amount: 2 }));
  },
  async onPlay() {}
};
