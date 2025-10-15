import { InterceptModifier } from '../../../../modifier/modifiers/intercept.modifier';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  HERO_JOBS,
  RARITIES
} from '../../../card.enums';

export const shieldMaiden: MinionBlueprint = {
  id: 'shield-maiden',
  name: 'Shieldmaiden',
  cardIconId: 'minions/shield-maiden',
  description: `@Intercept@.`,
  collectable: true,
  unique: false,
  manaCost: 3,
  speed: CARD_SPEED.SLOW,
  atk: 2,
  maxHp: 5,
  rarity: RARITIES.COMMON,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  job: HERO_JOBS.WARRIOR,
  spellSchool: null,
  setId: CARD_SETS.CORE,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(new InterceptModifier(game, card, {}));
  },
  async onPlay() {}
};
