import { AttackerModifier } from '../../../../modifier/modifiers/attacker.modifier';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  HERO_JOBS,
  RARITIES
} from '../../../card.enums';

export const hotHeadedRecruit: MinionBlueprint = {
  id: 'hot-headed-recruit',
  name: 'Hot-Headed Recruit',
  cardIconId: 'minions/hot-headed-recruit',
  description: `@Attacker(3)@.`,
  collectable: true,
  unique: false,
  manaCost: 2,
  atk: 2,
  maxHp: 1,
  rarity: RARITIES.COMMON,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  setId: CARD_SETS.CORE,
  speed: CARD_SPEED.SLOW,
  job: HERO_JOBS.WARRIOR,
  spellSchool: null,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(new AttackerModifier(game, card, { amount: 3 }));
  },
  async onPlay() {}
};
