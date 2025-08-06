import dedent from 'dedent';
import { OnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';
import { TideModifierMixin } from '../../../../modifier/mixins/tide.mixin';
import { TidesFavoredModifier } from '../../../../modifier/modifiers/tide-modifier';
import { SimpleHealthBuffModifier } from '../../../../modifier/modifiers/simple-health-buff.modifier';
import { PusherModifier } from '../../../../modifier/modifiers/pusher.modifier';

export const waterElemental: MinionBlueprint = {
  id: 'water-elemental',
  name: 'Water Elemental',
  cardIconId: 'unit-water-elemental',
  description: dedent`
  @On Enter@ : Increase your @Tide@ by 1.
  @Tide (3)@ : Gain @Pusher@ +2 @[health]@.
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
      new OnEnterModifier(game, card, async () => {
        await card.player.hero.modifiers.get(TidesFavoredModifier)?.raiseTides();
      })
    );
  },
  async onPlay(game, card) {
    await card.modifiers.add(
      new PusherModifier(game, card, {
        mixins: [new TideModifierMixin(game, [3])]
      })
    );

    await card.modifiers.add(
      new SimpleHealthBuffModifier('water-elemental-tides-hp-buff', game, card, {
        amount: 2,
        mixins: [new TideModifierMixin(game, [3])]
      })
    );
  }
};
