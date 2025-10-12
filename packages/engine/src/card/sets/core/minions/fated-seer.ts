import { OnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import { scry } from '../../../card-actions-utils';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  HERO_JOBS,
  RARITIES
} from '../../../card.enums';

export const fatedSeer: MinionBlueprint = {
  id: 'fated-seer',
  name: 'Fated Seer',
  cardIconId: 'minions/fated-seer',
  description: `@On Enter@: @Scry 3@.`,
  collectable: true,
  unique: false,
  manaCost: 2,
  speed: CARD_SPEED.SLOW,
  atk: 1,
  maxHp: 3,
  rarity: RARITIES.COMMON,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  job: HERO_JOBS.MAGE,
  spellSchool: null,
  setId: CARD_SETS.CORE,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new OnEnterModifier(game, card, {
        handler: async () => {
          await scry(game, card, 3);
        }
      })
    );
  },
  async onPlay() {}
};
