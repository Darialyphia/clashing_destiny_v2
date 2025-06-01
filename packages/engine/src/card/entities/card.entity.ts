import { type JSONObject } from '@game/shared';
import { EntityWithModifiers } from '../../entity';
import type { Game } from '../../game/game';
import { ModifierManager } from '../../modifier/modifier-manager.component';
import type { Player } from '../../player/player.entity';
import { Interceptable } from '../../utils/interceptable';
import type { CardBlueprint } from '../card-blueprint';
import { CARD_DECK_SOURCES, CARD_EVENTS, type CardDeckSource } from '../card.enums';
import {
  CardAddToHandevent,
  CardAfterDestroyEvent,
  CardBeforeDestroyEvent,
  CardDiscardEvent,
  CardExhaustEvent,
  CardWakeUpEvent
} from '../card.events';
import { match } from 'ts-pattern';
import type { CardLocation } from '../components/card-manager.component';
import { KeywordManagerComponent } from '../components/keyword-manager.component';
import { IllegalGameStateError } from '../../game/game-error';
import { isDestinyDeckCard, isMainDeckCard } from '../../board/board.system';

export type CardOptions<T extends CardBlueprint = CardBlueprint> = {
  id: string;
  blueprint: T;
};

export type AnyCard = Card<any, any, any>;
export type CardInterceptors = {
  manaCost: Interceptable<number | null>;
  destinyCost: Interceptable<number | null>;
  player: Interceptable<Player>;
};

export const makeCardInterceptors = (): CardInterceptors => ({
  manaCost: new Interceptable(),
  destinyCost: new Interceptable(),
  player: new Interceptable()
});

export type SerializedCard = {
  id: string;
  entityType: 'card';
  player: string;
  isExhausted: boolean;
  name: string;
  description: string;
  canPlay: boolean;
  source: CardDeckSource;
  location: CardLocation | null;
  keywords: Array<{ id: string; name: string; description: string }>;
};

export abstract class Card<
  TSerialized extends JSONObject,
  TInterceptors extends CardInterceptors = CardInterceptors,
  TBlueprint extends CardBlueprint = CardBlueprint
> extends EntityWithModifiers<TInterceptors> {
  protected game: Game;

  blueprint: TBlueprint;

  protected originalPlayer: Player;

  protected _isExhausted = false;

  readonly keywordManager = new KeywordManagerComponent();

  protected playedAtTurn: number | null = null;

  constructor(
    game: Game,
    player: Player,
    interceptors: TInterceptors,
    options: CardOptions<TBlueprint>
  ) {
    super(options.id, interceptors);
    this.game = game;
    this.originalPlayer = player;
    this.blueprint = options.blueprint as any;
    this.modifiers = new ModifierManager(this);
  }

  async init() {
    await this.blueprint.onInit(this.game, this as any);
  }

  get kind() {
    return this.blueprint.kind;
  }

  get affinity() {
    return this.blueprint.affinity;
  }

  get keywords() {
    return this.keywordManager.keywords;
  }

  get player() {
    return this.interceptors.player.getValue(this.originalPlayer, {});
  }

  get deckSource() {
    return this.blueprint.deckSource;
  }

  get isMainDeckCard() {
    return this.deckSource === CARD_DECK_SOURCES.MAIN_DECK;
  }

  get isDestinyDeckCard() {
    return this.deckSource === CARD_DECK_SOURCES.DESTINY_DECK;
  }

  get blueprintId() {
    return this.blueprint.id;
  }

  get isExhausted() {
    return this._isExhausted;
  }

  get location() {
    return this.player.cardManager.findCard(this.id)?.location;
  }

  get manaCost(): number {
    if ('manaCost' in this.blueprint) {
      return this.interceptors.manaCost.getValue(this.blueprint.manaCost, {}) ?? 0;
    }
    return 0;
  }

  get destinyCost() {
    if ('destinyCost' in this.blueprint) {
      return this.interceptors.destinyCost.getValue(this.blueprint.destinyCost, {}) ?? 0;
    }
    return 0;
  }

  get canPayManaCost() {
    return (
      this.player.cardManager.hand.filter(card => !card.equals(this)).length >=
      this.manaCost
    );
  }

  get canPayDestinyCost() {
    return this.player.cardManager.destinyZone.size >= this.destinyCost;
  }

  removeFromCurrentLocation() {
    if (!this.location) {
      return;
    }
    match(this.location)
      .with('hand', () => {
        this.player.cardManager.removeFromHand(this);
      })
      .with('discardPile', () => {
        if (!isMainDeckCard(this)) {
          throw new IllegalGameStateError(
            `Cannot remove card ${this.id} from discard pile when it is not a main deck card.`
          );
        }
        this.player.cardManager.removeFromDiscardPile(this);
      })
      .with('banishPile', () => {
        if (!isMainDeckCard(this)) {
          throw new IllegalGameStateError(
            `Cannot remove card ${this.id} from banish pile when it is not a main deck card.`
          );
        }
        this.player.cardManager.removeFromBanishPile(this);
      })
      .with('mainDeck', () => {
        if (!isMainDeckCard(this)) {
          throw new IllegalGameStateError(
            `Cannot remove card ${this.id} from main deck when it is not a main deck card.`
          );
        }
        this.player.cardManager.mainDeck.pluck(this);
      })
      .with('destinyDeck', () => {
        if (!isDestinyDeckCard(this)) {
          throw new IllegalGameStateError(
            `Cannot remove card ${this.id} from destiny deck when it is not a destiny deck card.`
          );
        }
        this.player.cardManager.destinyDeck.pluck(this);
      })
      .with('destinyZone', () => {
        if (!isMainDeckCard(this)) {
          throw new IllegalGameStateError(
            `Cannot remove card ${this.id} from destiny zone pile when it is not a main deck card.`
          );
        }
        this.player.cardManager.removeFromDestinyZone(this);
      })
      .with('board', () => {
        if (!isMainDeckCard(this)) {
          throw new IllegalGameStateError(
            `Cannot remove card ${this.id} from board pile when it is not a main deck card.`
          );
        }
        this.player.boardSide.remove(this);
      })
      .exhaustive();
  }

  sendToDiscardPile() {
    if (!isMainDeckCard(this)) {
      throw new IllegalGameStateError(
        `Cannot send card ${this.id} to discard pile when it is not a main deck card.`
      );
    }
    this.removeFromCurrentLocation();
    this.player.cardManager.sendToDiscardPile(this);
  }

  sendToBanishPile() {
    if (!isMainDeckCard(this)) {
      throw new IllegalGameStateError(
        `Cannot send card ${this.id} to banish pile when it is not a main deck card.`
      );
    }
    this.removeFromCurrentLocation();
    this.player.cardManager.sendToBanishPile(this);
  }

  sendToDestinyZone() {
    if (!isMainDeckCard(this)) {
      throw new IllegalGameStateError(
        `Cannot send card ${this.id} to destiny zone when it is not a main deck card.`
      );
    }
    this.removeFromCurrentLocation();
    this.player.cardManager.sendToDestinyZone(this);
  }

  protected updatePlayedAt() {
    this.playedAtTurn = this.game.gamePhaseSystem.elapsedTurns;
  }
  abstract canPlay(): boolean;

  abstract play(): Promise<void>;

  protected serializeBase(): SerializedCard {
    return {
      id: this.id,
      source: this.deckSource,
      entityType: 'card',
      player: this.player.id,
      isExhausted: this.isExhausted,
      name: this.blueprint.name,
      description: this.blueprint.description,
      canPlay: this.canPlay(),
      location: this.location ?? null,
      keywords: this.keywords.map(keyword => ({
        id: keyword.id,
        name: keyword.name,
        description: keyword.description
      }))
    };
  }

  abstract serialize(): TSerialized;

  async discard() {
    if (!isMainDeckCard(this)) {
      throw new IllegalGameStateError(
        `Cannot discard card ${this.id} when it is not a main deck card.`
      );
    }
    await (this as this).game.emit(
      CARD_EVENTS.CARD_DISCARD,
      new CardDiscardEvent({ card: this })
    );
    this.player.cardManager.discard(this);
  }

  async addToHand() {
    if (!isMainDeckCard(this)) {
      throw new IllegalGameStateError(
        `Cannot discard card ${this.id} when it is not a main deck card.`
      );
    }
    await (this as this).game.emit(
      CARD_EVENTS.CARD_ADD_TO_HAND,
      new CardAddToHandevent({ card: this })
    );
    this.removeFromCurrentLocation();
    this.player.cardManager.addToHand(this);
  }

  async exhaust() {
    await this.game.emit(CARD_EVENTS.CARD_EXHAUST, new CardExhaustEvent({ card: this }));
    this._isExhausted = true;
  }

  async wakeUp() {
    await this.game.emit(CARD_EVENTS.CARD_WAKE_UP, new CardWakeUpEvent({ card: this }));
    this._isExhausted = false;
  }

  async destroy() {
    await this.game.emit(
      CARD_EVENTS.CARD_BEFORE_DESTROY,
      new CardBeforeDestroyEvent({ card: this })
    );
    await match(this.deckSource)
      .with(CARD_DECK_SOURCES.MAIN_DECK, () => this.sendToDiscardPile())
      .with(CARD_DECK_SOURCES.DESTINY_DECK, () => this.sendToBanishPile())
      .exhaustive();
    await this.game.emit(
      CARD_EVENTS.CARD_AFTER_DESTROY,
      new CardAfterDestroyEvent({ card: this })
    );
  }

  isAlly(card: AnyCard) {
    return this.player.equals(card.player);
  }

  isEnemy(card: AnyCard) {
    return !this.isAlly(card);
  }
}
