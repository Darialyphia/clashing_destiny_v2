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
import { UnitInterceptorModifierMixin } from '../../../../modifier/mixins/interceptor.mixin';
import { TideModifier } from '../../../../modifier/modifiers/tide-modifier';

export const playfulEels: MinionBlueprint = {
  id: 'playfulEels',
  name: 'Playful Eels',
  cardIconId: 'unit-playful-eels',
  description: `@Elusive@.`,
  collectable: true,
  unique: false,
  manaCost: 1,
  atk: 1,
  maxHp: 1,
  rarity: RARITIES.COMMON,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  affinity: AFFINITIES.WATER,
  setId: CARD_SETS.CORE,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(new ElusiveModifier(game, card));
  },
  async onPlay() {}
};
