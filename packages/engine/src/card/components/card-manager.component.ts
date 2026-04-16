import { isDefined, shuffleArray } from '@game/shared';
import type { Game } from '../../game/game';
import type { AnyCard } from '../entities/card.entity';
import { Deck } from '../entities/deck.entity';
import { Player } from '../../player/player.entity';
import { GAME_EVENTS } from '../../game/game.events';
import { PlayerBeforeDrawEvent, PlayerAfterDrawEvent } from '../../player/player.events';
import { MinionCard } from '../entities/minion-card.entity';
import { SpellCard } from '../entities/spell-card.entity';
import { ArtifactCard } from '../entities/artifact-card.entity';
import { CARD_KINDS, CARD_LOCATIONS, type CardLocation } from '../card.enums';
import type { DestinyCard } from '../entities/destiny-card.entity';
import type { HeroCard } from '../entities/hero-card.entity';

export type CardManagerComponentOptions = {
  deck: { blueprintId: string; isFoil: boolean }[];
  maxHandSize: number;
  shouldShuffleDeck: boolean;
};

export type DeckCard = MinionCard | SpellCard | ArtifactCard;

export class CardManagerComponent {
  private game: Game;

  readonly deck: Deck<DeckCard>;

  readonly destinyDeck: Deck<DestinyCard>;

  readonly hero!: HeroCard;

  readonly hand: DeckCard[] = [];

  readonly discardPile = new Set<DeckCard>();

  readonly banishPile = new Set<DeckCard>();

  constructor(
    game: Game,
    private player: Player,
    private options: CardManagerComponentOptions
  ) {
    this.game = game;
    this.deck = new Deck(this.game, player);
    this.destinyDeck = new Deck(this.game, player);

    if (options.shouldShuffleDeck) {
      this.deck.shuffle();
    }
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
    this.deck.populate(
      cards.filter(
        c => c.kind !== CARD_KINDS.HERO && c.kind !== CARD_KINDS.DESTINY
      ) as DeckCard[]
    );
    this.destinyDeck.populate(
      cards.filter(c => c.kind === CARD_KINDS.DESTINY) as DestinyCard[]
    );
    // @ts-expect-error
    this.hero = cards.find(c => c.kind === CARD_KINDS.HERO)! as HeroCard;
    if (this.game.config.SHUFFLE_DECK_ON_GAME_START) {
      this.deck.shuffle();
    }

    this.hand.push(...this.deck.draw(this.game.config.INITIAL_HAND_SIZE));
  }

  get isHandFull() {
    return this.hand.length === this.options.maxHandSize;
  }

  get remainingCardsInMainDeck() {
    return this.deck.remaining;
  }

  get mainDeckSize() {
    return this.deck.size;
  }

  findCard<T extends DeckCard>(
    id: string
  ): {
    card: T;
    location: CardLocation;
  } | null {
    const card = this.hand.find(card => card.id === id);
    if (card) return { card: card as T, location: CARD_LOCATIONS.HAND };

    const deckCard = this.deck.cards.find(card => card.id === id);
    if (deckCard) return { card: deckCard as T, location: CARD_LOCATIONS.DECK };

    const discardPileCard = [...this.discardPile].find(card => card.id === id);
    if (discardPileCard)
      return { card: discardPileCard as T, location: CARD_LOCATIONS.DISCARD_PILE };

    const onBoardCard =
      this.player.units.find(unit => unit?.card.id === id)?.card ||
      this.player.artifactManager.artifacts.find(artifact => artifact.card.id === id)
        ?.card;
    if (onBoardCard) return { card: onBoardCard as T, location: CARD_LOCATIONS.BOARD };
    return null;
  }

  getCardInHandAt(index: number) {
    return [...this.hand][index];
  }

  getCardInHandById(id: string) {
    return this.hand.find(card => card.id === id);
  }

  async drawFromDeck(amount: number) {
    if (this.isHandFull) return;

    const amountToDraw = Math.min(
      amount,
      this.deck.remaining,
      this.options.maxHandSize - this.hand.length
    );
    if (amountToDraw <= 0) return;
    await this.game.emit(
      GAME_EVENTS.PLAYER_BEFORE_DRAW,
      new PlayerBeforeDrawEvent({
        player: this.player,
        amount: amountToDraw
      })
    );
    const cards = this.deck.draw(amountToDraw);

    for (const card of cards) {
      await card.addToHand();
    }

    await this.game.emit(
      GAME_EVENTS.PLAYER_AFTER_DRAW,
      new PlayerAfterDrawEvent({
        player: this.player,
        cards
      })
    );
  }

  async drawFromPool(cards: DeckCard[], amount: number) {
    const amountToDraw = Math.min(
      amount,
      cards.length,
      this.options.maxHandSize - this.hand.length
    );
    if (amountToDraw <= 0) return;

    await this.game.emit(
      GAME_EVENTS.PLAYER_BEFORE_DRAW,
      new PlayerBeforeDrawEvent({
        player: this.player,
        amount: amountToDraw
      })
    );
    const shuffledPool = shuffleArray(cards, () => this.game.rngSystem.next());
    const drawnCards = shuffledPool.splice(0, amountToDraw);

    for (const card of drawnCards) {
      await card.addToHand();
    }

    await this.game.emit(
      GAME_EVENTS.PLAYER_AFTER_DRAW,
      new PlayerAfterDrawEvent({
        player: this.player,
        cards
      })
    );
  }

  removeFromHand(card: AnyCard) {
    const index = this.hand.findIndex(handCard => handCard.equals(card));
    if (index === -1) return;
    this.hand.splice(index, 1);
  }

  discard(card: DeckCard) {
    this.removeFromHand(card);
    this.sendToDiscardPile(card);
  }

  sendToDiscardPile(card: DeckCard) {
    this.discardPile.add(card as DeckCard);
  }

  removeFromDiscardPile(card: DeckCard) {
    this.discardPile.delete(card);
  }

  sendToBanishPile(card: DeckCard) {
    this.banishPile.add(card);
  }

  removeFromBanishPile(card: DeckCard) {
    this.banishPile.delete(card);
  }

  replaceCardAt(index: number, random = true) {
    const card = this.getCardInHandAt(index);
    if (!card) return card;

    const replacement = random ? this.deck.randomReplace(card) : this.deck.replace(card);
    this.hand[index] = replacement;

    return replacement;
  }

  async addToHand(card: DeckCard, index?: number) {
    if (this.isHandFull) return;
    if (isDefined(index)) {
      this.hand.splice(index, 0, card);
      return;
    }
    this.hand.push(card);
  }
}
