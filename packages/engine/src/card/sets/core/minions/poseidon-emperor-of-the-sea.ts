import dedent from 'dedent';
import { ElusiveModifier } from '../../../../modifier/modifiers/elusive.modiier';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';
import {
  FixTideModifier,
  TidesFavoredModifier
} from '../../../../modifier/modifiers/tide-modifier';

export const poseidonEmperorOfTheSea: MinionBlueprint = {
  id: 'poseidonEmperorOfTheSea',
  name: 'Poseidon, Emperor of the Sea',
  cardIconId: 'unit-poseidon-emperor-of-the-sea',
  description: dedent`
  @Unique@.
  Your @Tide@ is always at 3.`,
  collectable: true,
  unique: true,
  manaCost: 5,
  atk: 3,
  maxHp: 5,
  rarity: RARITIES.LEGENDARY,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  affinity: AFFINITIES.WATER,
  setId: CARD_SETS.CORE,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(new FixTideModifier(game, card, 3));
  },
  async onPlay(game, card) {
    await card.player.hero.modifiers.get(TidesFavoredModifier)?.setStacks(3);
  }
};
