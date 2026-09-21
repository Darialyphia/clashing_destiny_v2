import { isDefined } from '@game/shared';
import type { Game } from '../../game/game';
import type { AnyCard } from '../entities/card.entity';
import { Deck } from '../entities/deck.entity';
import { Player } from '../../player/player.entity';
import { CARD_KINDS, CARD_LOCATIONS, type CardLocation } from '../card.enums';
import { GAME_EVENTS } from '../../game/game.events';
import { PlayerDrawEvent } from '../../player/player.events';
import type { DestinyCard } from '../entities/destiny.entity';
import type { RuneCard } from '../entities/rune.entity';
import { GAME_PHASES } from '../../game/game.enums';

export type CardManagerComponentOptions = {
  maxHandSize: number;
  shouldShuffleDeck: boolean;
  deck: { blueprintId: string; isFoil: boolean }[];
};

export class CardManagerComponent {
  private game: Game;

  readonly mainDeck: Deck<AnyCard>;

  readonly destinyDeck: Deck<DestinyCard>;

  readonly runeDeck: Deck<RuneCard>;

  readonly hand: AnyCard[] = [];

  readonly discardPile = new Set<AnyCard>();

  readonly banishPile = new Set<AnyCard>();

  readonly runeZone = new Set<RuneCard>();

  readonly reserve = new Set<AnyCard>();

  constructor(
    game: Game,
    private player: Player,
    private options: CardManagerComponentOptions
  ) {
    this.game = game;
    this.mainDeck = new Deck(this.game, player);
    this.destinyDeck = new Deck(this.game, player);
    this.runeDeck = new Deck(this.game, player);
  }

  private async buildCards<T extends AnyCard>(
    cards: { blueprintId: string; isFoil: boolean }[]
  ) {
    const result: T[] = [];
    for (const card of cards) {
      result.push(
        await this.game.cardSystem.addCard<T>(this.player, card.blueprintId, card.isFoil)
      );
    }
    return result;
  }

  async init() {
    const cards = await this.buildCards<AnyCard>(this.options.deck);
    this.mainDeck.populate(
      cards.filter(c => c.kind !== CARD_KINDS.DESTINY && c.kind !== CARD_KINDS.RUNE)
    );
    this.destinyDeck.populate(
      cards.filter(c => c.kind === CARD_KINDS.DESTINY) as DestinyCard[]
    );
    this.runeDeck.populate(cards.filter(c => c.kind === CARD_KINDS.RUNE) as RuneCard[]);

    if (this.options.shouldShuffleDeck) {
      this.mainDeck.shuffle();
      this.destinyDeck.shuffle();
      this.runeDeck.shuffle();
    }

    this.hand.push(...this.mainDeck.draw(this.game.config.INITIAL_HAND_SIZE));

    await this.game.on(GAME_EVENTS.BEFORE_CHANGE_PHASE, async event => {
      if (event.data.to === GAME_PHASES.SUPPLY) {
        for (const card of this.reserve) {
          await card.addToHand();
        }
      }
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
    if (card) return { card, location: CARD_LOCATIONS.HAND };

    const mainDeckCard = this.mainDeck.cards.find(card => card.id === id);
    if (mainDeckCard) return { card: mainDeckCard, location: CARD_LOCATIONS.MAIN_DECK };

    const discardPileCard = [...this.discardPile].find(card => card.id === id);
    if (discardPileCard)
      return { card: discardPileCard, location: CARD_LOCATIONS.DISCARD_PILE };

    const banishPileCard = [...this.banishPile].find(card => card.id === id);
    if (banishPileCard)
      return { card: banishPileCard, location: CARD_LOCATIONS.BANISH_PILE };

    const baseCard = this.player.boardSide.getCardInBase(id);
    if (baseCard) return { card: baseCard, location: CARD_LOCATIONS.BASE };

    const leftBattlefieldCard = this.player.boardSide.getCardInLeftBattlefield(id);
    if (leftBattlefieldCard)
      return { card: leftBattlefieldCard, location: CARD_LOCATIONS.LEFT_BATTLEFIELD };

    const rightBattlefieldCard = this.player.boardSide.getCardInRightBattlefield(id);
    if (rightBattlefieldCard)
      return { card: rightBattlefieldCard, location: CARD_LOCATIONS.RIGHT_BATTLEFIELD };

    const destinyDeckCard = this.destinyDeck.cards.find(card => card.id === id);
    if (destinyDeckCard)
      return { card: destinyDeckCard, location: CARD_LOCATIONS.DESTINY_DECK };

    const runeDeckCard = this.runeDeck.cards.find(card => card.id === id);
    if (runeDeckCard) return { card: runeDeckCard, location: CARD_LOCATIONS.RUNE_DECK };

    const runeZoneCard = [...this.runeZone].find(card => card.id === id);
    if (runeZoneCard) return { card: runeZoneCard, location: CARD_LOCATIONS.RUNE_ZONE };

    const reserveCard = [...this.reserve].find(card => card.id === id);
    if (reserveCard) return { card: reserveCard, location: CARD_LOCATIONS.RESERVE };

    return null;
  }

  getCardInHandAt(index: number) {
    return [...this.hand][index];
  }

  getCardInHandById(id: string) {
    return this.hand.find(card => card.id === id);
  }

  async drawWithFilter(amount: number, filter: (card: AnyCard) => boolean) {
    if (this.isHandFull) return [];

    const amountToDraw = Math.min(
      amount,
      this.mainDeck.remaining,
      this.options.maxHandSize - this.hand.length
    );

    if (amountToDraw <= 0) return [];
    await this.game.emit(
      GAME_EVENTS.PLAYER_BEFORE_DRAW,
      new PlayerDrawEvent({
        player: this.player,
        amount: amountToDraw
      })
    );
    const candidates = this.mainDeck.cards.filter(filter);
    const cards = candidates.slice(0, amountToDraw);

    for (const card of cards) {
      this.mainDeck.pluck(card);
      await card.addToHand();
    }

    await this.game.emit(
      GAME_EVENTS.PLAYER_AFTER_DRAW,
      new PlayerDrawEvent({
        player: this.player,
        amount: amountToDraw
      })
    );

    return cards;
  }

  async draw(amount: number) {
    if (this.isHandFull) return [];

    const amountToDraw = Math.min(
      amount,
      this.mainDeck.remaining,
      this.options.maxHandSize - this.hand.length
    );

    if (amountToDraw <= 0) return [];
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

    return cards;
  }

  removeFromRuneZone(card: RuneCard) {
    this.runeZone.delete(card);
  }

  removeFromHand(card: AnyCard) {
    const index = this.hand.findIndex(handCard => handCard.equals(card));
    if (index === -1) return;
    this.hand.splice(index, 1);
  }

  discard(card: AnyCard) {
    this.removeFromHand(card);
    this.sendToDiscardPile(card);
  }

  mill(amount: number) {
    const cards = this.mainDeck.draw(amount);
    for (const card of cards) {
      this.sendToDiscardPile(card);
    }
    return cards;
  }

  sendToDiscardPile(card: AnyCard) {
    this.discardPile.add(card);
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

  replaceCardAt(index: number) {
    const card = this.getCardInHandAt(index);
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

  placeInRuneZone(card: RuneCard) {
    this.runeZone.add(card);
  }

  sendToReserve(card: AnyCard) {
    this.reserve.add(card);
  }

  removeFromReserve(card: AnyCard) {
    this.reserve.delete(card);
  }
}
