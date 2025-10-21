import dedent from 'dedent';
import type { SigilBlueprint } from '../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';
import { OnDeathModifier } from '../../../../modifier/modifiers/on-death.modifier';

export const sigilOfHope: SigilBlueprint = {
  id: 'sigil-of-hope',
  name: 'Sigil of Hope',
  cardIconId: 'sigils/sigil-of-hope',
  description: dedent`
  @On Destroyed@: Draw cards equal to your hero's level.
  `,
  collectable: true,
  unique: false,
  destinyCost: 1,
  maxCountdown: 4,
  rarity: RARITIES.RARE,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  kind: CARD_KINDS.SIGIL,
  spellSchool: null,
  job: null,
  speed: CARD_SPEED.SLOW,
  setId: CARD_SETS.CORE,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new OnDeathModifier(game, card, {
        handler: async (event, modifier, position) => {
          await card.player.cardManager.draw(card.player.hero.level);
        }
      })
    );
  },
  async onPlay() {}
};
