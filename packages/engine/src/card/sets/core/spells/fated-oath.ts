import { GAME_EVENTS } from '../../../../game/game.events';
import { CardInterceptorModifierMixin } from '../../../../modifier/mixins/interceptor.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import type { SpellBlueprint } from '../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';

export const fatedOath: SpellBlueprint = {
  id: 'fated-oath',
  name: 'Fated Oath',
  cardIconId: 'spells/fated-oath',
  description:
    '@[level] 1+ bonus@: Search your deck for a card and banish it. At the end of your next turn, add it to your Destiny Deck as a Destiny Card that costs @[destiny] 1@.',
  collectable: true,
  unique: false,
  destinyCost: 1,
  speed: CARD_SPEED.FLASH,
  spellSchool: null,
  job: null,
  kind: CARD_KINDS.SPELL,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.LEGENDARY,
  tags: [],
  abilities: [],
  canPlay: () => true,
  getPreResponseTargets: () => Promise.resolve([]),
  async onInit() {},
  async onPlay(game, card) {
    const [cardToBanish] = await game.interaction.chooseCards({
      player: card.player,
      label: 'Choose a card to banish',
      minChoiceCount: 1,
      maxChoiceCount: 1,
      choices: card.player.cardManager.mainDeck.cards
    });

    if (!cardToBanish) return;

    cardToBanish.sendToBanishPile();

    let counter = 2;
    const stop = game.on(GAME_EVENTS.TURN_END, async () => {
      counter--;
      if (counter <= 0) {
        stop();
        await cardToBanish.modifiers.add(
          new Modifier('fated-oath-modifier', game, cardToBanish, {
            mixins: [
              new CardInterceptorModifierMixin(game, {
                key: 'deckSource',
                interceptor() {
                  return CARD_DECK_SOURCES.DESTINY_DECK;
                }
              }),
              new CardInterceptorModifierMixin(game, {
                key: 'destinyCost',
                interceptor() {
                  return 1;
                }
              }),
              new CardInterceptorModifierMixin(game, {
                key: 'manaCost',
                interceptor() {
                  return null;
                }
              })
            ]
          })
        );
        cardToBanish.removeFromCurrentLocation();
        card.player.cardManager.destinyDeck.addToBottom(cardToBanish);
      }
    });
  }
};
