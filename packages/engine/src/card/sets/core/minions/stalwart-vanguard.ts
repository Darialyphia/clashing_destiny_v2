import { EchoedDestinyModifier } from '../../../../modifier/modifiers/echoed-destiny.modifier';
import { TauntModifier } from '../../../../modifier/modifiers/taunt.modifier';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';

export const stalwartVanguard: MinionBlueprint = {
  id: 'stalwart-vanguard',
  name: 'Stalwart Vanguard',
  cardIconId: 'unit-stalwart-vanguard',
  description: `@Taunt@, @Echoed Destiny@.`,
  collectable: true,
  unique: false,
  manaCost: 2,
  atk: 0,
  maxHp: 3,
  rarity: RARITIES.COMMON,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  affinity: AFFINITIES.NORMAL,
  setId: CARD_SETS.CORE,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(new TauntModifier(game, card, {}));
    await card.modifiers.add(new EchoedDestinyModifier(game, card));
  },
  async onPlay() {}
};
