import dedent from 'dedent';
import type { SpellBlueprint } from '../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';
import { GAME_EVENTS } from '../../../../game/game.events';

export const sereneMind: SpellBlueprint = {
  id: 'serene-mind',
  name: 'Serene Mind',
  cardIconId: 'spells/serene-mind',
  description: dedent`Look at your opponent's hand and choose a card that they are able to play. At the end of the turn, if they haven't played that card, draw a card and heal your Hero for 3.`,
  collectable: true,
  unique: false,
  destinyCost: 1,
  speed: CARD_SPEED.FAST,
  spellSchool: null,
  job: null,
  kind: CARD_KINDS.SPELL,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  abilities: [],
  tags: [],
  canPlay: () => true,
  getPreResponseTargets: () => Promise.resolve([]),
  async onInit() {},
  async onPlay(game, card) {
    const choices = card.player.opponent.cardManager.hand.filter(handCard =>
      handCard.canPlay()
    );
    if (choices) return;

    const [chosenCard] = await game.interaction.chooseCards({
      player: card.player,
      label: "Choose a card from your opponent's hand",
      minChoiceCount: 1,
      maxChoiceCount: 1,
      choices
    });

    game.once(GAME_EVENTS.TURN_END, async () => {
      if (chosenCard.location === 'hand') {
        await card.player.cardManager.draw(1);
        await card.player.hero.heal(3);
      }
    });
  }
};
