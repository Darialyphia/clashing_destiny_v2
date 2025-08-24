import dedent from 'dedent';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';
import { TideModifierMixin } from '../../../../modifier/mixins/tide.mixin';
import { DoubleAttackModifier } from '../../../../modifier/modifiers/double-attack.modifier';

export const nagaSkirmisher: MinionBlueprint = {
  id: 'naga-skirmisher',
  name: 'Naga Skirmisher',
  cardIconId: 'unit-naga-skirmisher',
  description: dedent`
  @Tide (3)@: @Double Attack@.
  `,
  collectable: true,
  unique: false,
  manaCost: 3,
  atk: 2,
  maxHp: 3,
  rarity: RARITIES.COMMON,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  affinity: AFFINITIES.WATER,
  setId: CARD_SETS.CORE,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new DoubleAttackModifier(game, card, {
        mixins: [new TideModifierMixin(game, [3])]
      })
    );
  },
  async onPlay() {}
};
