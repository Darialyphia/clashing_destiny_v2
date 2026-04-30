import type { HeroBlueprint } from '../../../../card-blueprint';
import { defaultCardArt } from '../../../../card-utils';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  CARD_DECK_SOURCES,
  JOBS
} from '../../../../card.enums';

export const erinaVioletWitch: HeroBlueprint = {
  id: 'erina-violet-witch',
  kind: CARD_KINDS.HERO,
  collectable: true,
  name: 'Erina, Violet Witch',
  description: '',
  setId: CARD_SETS.CORE,
  rarity: RARITIES.EPIC,
  art: defaultCardArt('placeholder'),
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  jobs: [JOBS.MAGE],
  tags: [],
  manaCost: 0,
  atk: 2,
  maxHp: 25,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {},
  async onPlay() {},
  aiHints: {
    shouldAttack: () => 1,
    shouldPlay: () => 1
  }
};
