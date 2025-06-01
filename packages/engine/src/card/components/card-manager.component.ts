import { isDefined } from '@game/shared';
import type { Game } from '../../game/game';
import type { AnyCard } from '../entities/card.entity';
import { Deck } from '../entities/deck.entity';
import type { Player } from '../../player/player.entity';
import { CARD_DECK_SOURCES } from '../card.enums';
import type { DestinyDeckCard, MainDeckCard } from '../../board/board.system';

export type CardManagerComponentOptions = {
  mainDeck: string[];
  destinyDeck: string[];
  maxHandSize: number;
  shouldShuffleDeck: boolean;
};

export type CardLocation =
  | 'hand'
  | 'mainDeck'
  | 'destinyDeck'
  | 'discardPile'
  | 'banishPile'
  | 'destinyZone'
  | 'board';

export class CardManagerComponent {
  private game: Game;

  readonly mainDeck: Deck<MainDeckCard>;

  readonly destinyDeck: Deck<DestinyDeckCard>;

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
    this.destinyDeck = new Deck(this.game, player);

    if (options.shouldShuffleDeck) {
      this.mainDeck.shuffle();
    }
  }

  async init() {
    this.mainDeck.populate(
      await Promise.all(
        this.options.mainDeck.map(card =>
          this.game.cardSystem.addCard<MainDeckCard>(this.player, card)
        )
      )
    );
    this.destinyDeck.populate(
      await Promise.all(
        this.options.destinyDeck.map(card =>
          this.game.cardSystem.addCard<DestinyDeckCard>(this.player, card)
        )
      )
    );
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

  get remainingCardsInDestinyDeck() {
    return this.destinyDeck.remaining;
  }

  get destinyDeckSize() {
    return this.destinyDeck.size;
  }

  findCard(id: string): {
    card: AnyCard;
    location: CardLocation;
  } | null {
    const card = this.hand.find(card => card.id === id);
    if (card) return { card, location: 'hand' };

    const mainDeckCard = this.mainDeck.cards.find(card => card.id === id);
    if (mainDeckCard) return { card: mainDeckCard, location: 'mainDeck' };

    const destinyDeckCard = this.destinyDeck.cards.find(card => card.id === id);
    if (destinyDeckCard) return { card: destinyDeckCard, location: 'destinyDeck' };

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

  getDestinyCardAt(index: number) {
    return this.destinyDeck.cards[index];
  }

  async draw(amount: number) {
    if (this.isHandFull) return;

    const amountToDraw = Math.min(
      amount,
      this.mainDeck.remaining,
      this.options.maxHandSize - this.hand.length
    );
    if (amountToDraw <= 0) return;
    const cards = this.mainDeck.draw(amountToDraw);

    cards.forEach(card => {
      this.addToHand(card);
    });
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

  removeFromDestinyDeck(card: AnyCard) {
    const index = this.destinyDeck.cards.findIndex(destinyCard =>
      destinyCard.equals(card)
    );
    if (index === -1) return;
    this.destinyDeck.cards.splice(index, 1);
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

  addToHand(card: MainDeckCard, index?: number) {
    if (this.isHandFull) return;
    if (isDefined(index)) {
      this.hand.splice(index, 0, card);
      return;
    }
    this.hand.push(card);
  }
}
