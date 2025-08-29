import dedent from 'dedent';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';
import { TauntModifier } from '../../../../modifier/modifiers/taunt.modifier';
import { OnDeathModifier } from '../../../../modifier/modifiers/on-death.modifier';

export const ceruleanWaveDisciple: MinionBlueprint = {
  id: 'cerulean-wave-disciple',
  name: 'Cerulean Wave Disciple',
  cardIconId: 'unit-cerulean-wave-disciple',
  description: dedent`
    @Taunt@.
    @On Death@ : Draw a card.
  `,
  collectable: true,
  unique: false,
  manaCost: 2,
  atk: 1,
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
    await card.modifiers.add(new TauntModifier(game, card, {}));
    await card.modifiers.add(
      new OnDeathModifier(game, card, {
        async handler() {
          await card.player.cardManager.draw(1);
        }
      })
    );
  },
  async onPlay() {}
};
