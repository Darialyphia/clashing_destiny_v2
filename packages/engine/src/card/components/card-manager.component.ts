import { isDefined } from '@game/shared';
import type { Game } from '../../game/game';
import type { AnyCard } from '../entities/card.entity';
import { Deck } from '../entities/deck.entity';
import type { Player } from '../../player/player.entity';
import { CARD_DECK_SOURCES } from '../card.enums';
import type { MainDeckCard } from '../../board/board.system';

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

  readonly mainDeck: Deck<AnyCard>;

  readonly destinyDeck: Deck<AnyCard>;

  readonly hand: AnyCard[] = [];

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
        this.options.mainDeck.map(card => this.game.cardSystem.addCard(this.player, card))
      )
    );
    this.destinyDeck.populate(
      await Promise.all(
        this.options.destinyDeck.map(card =>
          this.game.cardSystem.addCard(this.player, card)
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

  getCardAt(index: number) {
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

  discard(card: AnyCard) {
    this.removeFromHand(card);
    this.sendToDiscardPile(card);
  }

  sendToDiscardPile(card: AnyCard) {
    if (card.deckSource === CARD_DECK_SOURCES.DESTINY_DECK) {
      this.sendToBanishPile(card);
    } else {
      this.discardPile.add(card);
    }
  }

  removeFromDiscardPile(card: AnyCard) {
    this.discardPile.delete(card);
  }

  sendToBanishPile(card: AnyCard) {
    this.banishPile.add(card);
  }

  removeFromBanishPile(card: AnyCard) {
    this.banishPile.delete(card);
  }

  sendToDestinyZone(card: AnyCard) {
    this.destinyZone.add(card);
  }

  removeFromDestinyZone(card: AnyCard) {
    this.destinyZone.delete(card);
  }

  replaceCardAt(index: number) {
    const card = this.getCardAt(index);
    if (!card) return card;

    const replacement = this.mainDeck.replace(card);
    this.hand[index] = replacement;

    return replacement;
  }

  addToHand(card: AnyCard, index?: number) {
    if (this.isHandFull) return;
    if (isDefined(index)) {
      this.hand.splice(index, 0, card);
      return;
    }
    this.hand.push(card);
  }
}
