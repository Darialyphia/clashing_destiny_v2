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

export const flowkeeperSage: MinionBlueprint = {
  id: 'flowkeeperSage',
  name: 'Flowkeeper Sage',
  cardIconId: 'unit-flowkeeper-sage',
  description: dedent`
  @Elusive@.
  @Tide (3)@: Gain +2 @[attack]@.
  `,
  collectable: true,
  unique: false,
  manaCost: 4,
  atk: 3,
  maxHp: 4,
  rarity: RARITIES.RARE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  affinity: AFFINITIES.WATER,
  setId: CARD_SETS.CORE,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(new ElusiveModifier(game, card));
    await card.modifiers.add(
      new TideModifier(game, card, {
        allowedLevels: [3],
        mixins: [
          new UnitInterceptorModifierMixin(game, {
            key: 'atk',
            interceptor: value => value + 2
          })
        ]
      })
    );
  },
  async onPlay() {}
};
