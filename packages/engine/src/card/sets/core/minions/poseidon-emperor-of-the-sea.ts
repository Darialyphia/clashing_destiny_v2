import dedent from 'dedent';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES,
  SPELL_SCHOOLS
} from '../../../card.enums';
import { GAME_EVENTS } from '../../../../game/game.events';

export const poseidonEmperorOfTheSea: MinionBlueprint = {
  id: 'poseidon-emperor-of-the-sea',
  name: 'Poseidon, Emperor of the Sea',
  cardIconId: 'minions/poseidon-emperor-of-the-sea',
  description: dedent`
  This card also costs @[mana] 2@ to play.
  @On Enter@ and @On Attack@: Reveal a Water Spell in your Destiny Zone. If you do, put target card on top of its owner's deck.
  `,
  collectable: true,
  unique: false,
  destinyCost: 3,
  speed: CARD_SPEED.SLOW,
  atk: 3,
  maxHp: 7,
  rarity: RARITIES.LEGENDARY,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  kind: CARD_KINDS.MINION,
  job: null,
  spellSchool: SPELL_SCHOOLS.WATER,
  setId: CARD_SETS.CORE,
  abilities: [],
  tags: [],
  canPlay: (game, card) => card.player.cardManager.hand.length >= 2,
  async onInit(game, card) {
    game.on(GAME_EVENTS.CARD_DECLARE_PLAY, async event => {
      if (!event.data.card.equals(card)) return;
      const cards = await game.interaction.chooseCards({
        player: card.player,
        label: 'Select cards to pay for this card',
        minChoiceCount: 2,
        maxChoiceCount: 2,
        choices: card.player.cardManager.hand
      });
      for (const c of cards) {
        await c.sendToDestinyZone();
      }
    });
  },
  async onPlay() {}
};
