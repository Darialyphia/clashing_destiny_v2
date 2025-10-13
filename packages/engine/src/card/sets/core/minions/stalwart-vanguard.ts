import { LingeringDestinyModifier } from '../../../../modifier/modifiers/lingering-destiny.modifier';
import { ProtectorModifier } from '../../../../modifier/modifiers/protector';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';

export const stalwartVanguard: MinionBlueprint = {
  id: 'stalwart-vanguard',
  name: 'Stalwart Vanguard',
  cardIconId: 'minions/stalwart-vanguard',
  description: `@Protector@, @Lingering Destiny@`,
  collectable: true,
  unique: false,
  manaCost: 2,
  speed: CARD_SPEED.SLOW,
  atk: 0,
  maxHp: 4,
  rarity: RARITIES.COMMON,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  job: null,
  spellSchool: null,
  setId: CARD_SETS.CORE,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(new ProtectorModifier(game, card, {}));
    await card.modifiers.add(new LingeringDestinyModifier(game, card));
  },
  async onPlay() {}
};
