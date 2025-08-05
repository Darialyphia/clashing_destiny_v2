import dedent from 'dedent';
import { ElusiveModifier } from '../../../../modifier/modifiers/elusive.modiier';
import { SimpleAttackBuffModifier } from '../../../../modifier/modifiers/simple-attack-buff.modifier';
import type { MinionBlueprint } from '../../../card-blueprint';
import { sealAbility } from '../../../card-utils';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';
import { TideModifier } from '../../../../modifier/modifiers/tide-modifier';
import { UnitInterceptorModifierMixin } from '../../../../modifier/mixins/interceptor.mixin';
import { TogglableModifierMixin } from '../../../../modifier/mixins/togglable.mixin';

export const flowkeeperSage: MinionBlueprint = {
  id: 'flowkeeperSage',
  name: 'Flowkeeper Sage',
  cardIconId: 'unit-flowkeeper-sage',
  description: dedent`
  @Elusive@.
  @Tide (3)@: Gain +3 @[attack]@.
  `,
  collectable: true,
  unique: false,
  manaCost: 3,
  atk: 2,
  maxHp: 2,
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
          new TogglableModifierMixin(game, () => card.location === 'board'),
          new UnitInterceptorModifierMixin(game, {
            key: 'atk',
            interceptor: value => value + 3
          })
        ]
      })
    );
  },
  async onPlay() {}
};
