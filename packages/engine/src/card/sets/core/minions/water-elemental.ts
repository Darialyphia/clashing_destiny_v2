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
import { TidesFavoredModifier } from '../../../../modifier/modifiers/tide-modifier';
import { DrifterModifier } from '../../../../modifier/modifiers/drifter.modifier';

export const waterElemental: MinionBlueprint = {
  id: 'water-elemental',
  name: 'Water Elemental',
  cardIconId: 'unit-water-elemental',
  description: dedent`
  @On Enter@ : Raise your @Tide@ level.
  @Drifter@.
  `,
  collectable: true,
  unique: false,
  manaCost: 2,
  atk: 2,
  maxHp: 2,
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
      new OnEnterModifier(game, card, {
        handler: async () => {
          await card.player.hero.modifiers.get(TidesFavoredModifier)?.raiseTides();
        }
      })
    );
  },
  async onPlay(game, card) {
    await card.modifiers.add(new DrifterModifier(game, card, {}));
  }
};
