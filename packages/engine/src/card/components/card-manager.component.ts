import { isDefined } from '@game/shared';
import type { Game } from '../../game/game';
import type { AnyCard } from '../entities/card.entity';
import { Deck } from '../entities/deck.entity';
import { Player } from '../../player/player.entity';
import { CARD_DECK_SOURCES } from '../card.enums';
import type { MainDeckCard } from '../../board/board.system';
import { GAME_EVENTS } from '../../game/game.events';
import { PlayerDrawEvent } from '../../player/player.events';

export type CardManagerComponentOptions = {
  mainDeck: string[];
  maxHandSize: number;
  shouldShuffleDeck: boolean;
};

export type CardLocation =
  | 'hand'
  | 'mainDeck'
  | 'discardPile'
  | 'banishPile'
  | 'destinyZone'
  | 'board';

export class CardManagerComponent {
  private game: Game;

  readonly mainDeck: Deck<MainDeckCard>;

  readonly hand: MainDeckCard[] = [];

  readonly discardPile = new Set<MainDeckCard>();

  readonly banishPile = new Set<MainDeckCard>();

  readonly destinyZone = new Set<MainDeckCard>();

  constructor(
    game: Game,
    private player: Player,
    private options: CardManagerComponentOptions
  ) {
    this.game = game;
    this.mainDeck = new Deck(this.game, player);

    if (options.shouldShuffleDeck) {
      this.mainDeck.shuffle();
    }
  }

  private async buildCards<T extends AnyCard>(cards: string[]) {
    const result: T[] = [];
    for (const card of cards) {
      result.push(await this.game.cardSystem.addCard<T>(this.player, card));
    }
    return result;
  }

  async init() {
    const mainDeckCards = await this.buildCards<MainDeckCard>(this.options.mainDeck);

    this.mainDeck.populate(mainDeckCards);
    this.mainDeck.shuffle();
    this.hand.push(...this.mainDeck.draw(this.game.config.INITIAL_HAND_SIZE));
    const initialDestinyCards = this.mainDeck.draw(
      this.game.config.INITAL_CARDS_IN_DESTINY_ZONE
    );
    initialDestinyCards.forEach(card => {
      this.destinyZone.add(card);
    });
  }

  get isHandFull() {
    return this.hand.length === this.options.maxHandSize;
  }

  get remainingCardsInMainDeck() {
    return this.mainDeck.remaining;
  }

  get mainDeckSize() {
    return this.mainDeck.size;
  }

  findCard(id: string): {
    card: AnyCard;
    location: CardLocation;
  } | null {
    const card = this.hand.find(card => card.id === id);
    if (card) return { card, location: 'hand' };

    const mainDeckCard = this.mainDeck.cards.find(card => card.id === id);
    if (mainDeckCard) return { card: mainDeckCard, location: 'mainDeck' };

    const discardPileCard = [...this.discardPile].find(card => card.id === id);
    if (discardPileCard) return { card: discardPileCard, location: 'discardPile' };

    const banishPileCard = [...this.banishPile].find(card => card.id === id);
    if (banishPileCard) return { card: banishPileCard, location: 'banishPile' };

    const destinyZoneCard = [...this.destinyZone].find(card => card.id === id);
    if (destinyZoneCard) return { card: destinyZoneCard, location: 'destinyZone' };

    const onBoardCard = this.player.boardSide
      .getAllCardsInPlay()
      .find(card => card.id === id);
    if (onBoardCard) return { card: onBoardCard, location: 'board' };

    return null;
  }

  getCardInHandAt(index: number) {
    return [...this.hand][index];
  }

  async draw(amount: number) {
    if (this.isHandFull) return;

    const amountToDraw = Math.min(
      amount,
      this.mainDeck.remaining,
      this.options.maxHandSize - this.hand.length
    );
    if (amountToDraw <= 0) return;
    await this.game.emit(
      GAME_EVENTS.PLAYER_BEFORE_DRAW,
      new PlayerDrawEvent({
        player: this.player,
        amount: amountToDraw
      })
    );
    const cards = this.mainDeck.draw(amountToDraw);

    for (const card of cards) {
      await card.addToHand();
    }

    await this.game.emit(
      GAME_EVENTS.PLAYER_AFTER_DRAW,
      new PlayerDrawEvent({
        player: this.player,
        amount: amountToDraw
      })
    );
  }

  async drawIntoDestinyZone(amount: number) {
    const cards = this.mainDeck.draw(amount);

    cards.forEach(card => {
      this.sendToDestinyZone(card);
    });
  }

  removeFromHand(card: AnyCard) {
    const index = this.hand.findIndex(handCard => handCard.equals(card));
    if (index === -1) return;
    this.hand.splice(index, 1);
  }

  discard(card: MainDeckCard) {
    this.removeFromHand(card);
    this.sendToDiscardPile(card);
  }

  sendToDiscardPile(card: MainDeckCard) {
    if (card.deckSource === CARD_DECK_SOURCES.DESTINY_DECK) {
      this.sendToBanishPile(card);
    } else {
      this.discardPile.add(card as MainDeckCard);
    }
  }

  removeFromDiscardPile(card: MainDeckCard) {
    this.discardPile.delete(card);
  }

  sendToBanishPile(card: MainDeckCard) {
    this.banishPile.add(card);
  }

  removeFromBanishPile(card: MainDeckCard) {
    this.banishPile.delete(card);
  }

  sendToDestinyZone(card: MainDeckCard) {
    this.destinyZone.add(card);
  }

  removeFromDestinyZone(card: MainDeckCard) {
    this.destinyZone.delete(card);
  }

  replaceCardAt(index: number) {
    const card = this.getCardInHandAt(index);
    if (!card) return card;

    const replacement = this.mainDeck.replace(card);
    this.hand[index] = replacement;

    return replacement;
  }

  async addToHand(card: MainDeckCard, index?: number) {
    if (this.isHandFull) return;
    if (isDefined(index)) {
      this.hand.splice(index, 0, card);
      return;
    }
    this.hand.push(card);
  }
}
