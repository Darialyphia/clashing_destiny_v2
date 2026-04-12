import {
  type Defined,
  type JSONObject,
  type MaybePromise,
  type Point
} from '@game/shared';
import { EntityWithModifiers } from '../../utils/entity-with-modifiers';
import type { Game } from '../../game/game';
import { ModifierManager } from '../../modifier/modifier-manager.component';
import type { Player } from '../../player/player.entity';
import { Interceptable } from '../../utils/interceptable';
import type { CardBlueprint } from '../card-blueprint';
import {
  CARD_EVENTS,
  CARD_KINDS,
  CARD_LOCATIONS,
  type CardKind,
  type CardLocation,
  type JobId,
  type Rarity
} from '../card.enums';
import { CardAddToHandevent, CardDiscardEvent, type CardEventMap } from '../card.events';
import { match } from 'ts-pattern';
import { type DeckCard } from '../components/card-manager.component';
import { KeywordManagerComponent } from '../components/keyword-manager.component';
import { IllegalGameStateError } from '../../game/game-error';

export type CardOptions<T extends CardBlueprint = CardBlueprint> = {
  id: string;
  blueprint: T;
  isFoil: boolean;
};

export type AnyCard = Card<any, any, any>;
export type CardInterceptors = {
  manaCost: Interceptable<number>;
  player: Interceptable<Player>;
  canReplace: Interceptable<boolean>;
  shouldPassInitiativeAfterPlay: Interceptable<boolean>;
};

export const makeCardInterceptors = (): CardInterceptors => ({
  manaCost: new Interceptable(),
  player: new Interceptable(),
  canReplace: new Interceptable(),
  shouldPassInitiativeAfterPlay: new Interceptable()
});

export type SerializedCard = {
  id: string;
  entityType: 'card';
  isFoil: boolean;
  art: CardBlueprint['art'][string];
  kind: CardKind;
  rarity: Rarity;
  player: string;
  name: string;
  description: string;
  canPlay: boolean;
  canReplace: boolean;
  location: CardLocation | null;
  keywords: Array<{ id: string; name: string; description: string }>;
  modifiers: string[];
  jobs: JobId[];
  spacesToHighlight: Point[];
};

export const isDeckCard = (card: AnyCard): card is DeckCard => {
  return (
    card.blueprint.kind === CARD_KINDS.MINION ||
    card.blueprint.kind === CARD_KINDS.SPELL ||
    card.blueprint.kind === CARD_KINDS.ARTIFACT
  );
};

export abstract class Card<
  TSerialized extends JSONObject,
  TInterceptors extends CardInterceptors = CardInterceptors,
  TBlueprint extends CardBlueprint = CardBlueprint
> extends EntityWithModifiers<TInterceptors> {
  protected game: Game;

  blueprint: TBlueprint;

  protected originalPlayer: Player;

  readonly keywordManager = new KeywordManagerComponent();

  protected playedAtTurn: number | null = null;

  cancelPlay?: () => MaybePromise<void>;

  protected spacesToHighlight: Point[] = [];

  readonly isFoil: boolean;

  constructor(
    game: Game,
    player: Player,
    interceptors: TInterceptors,
    options: CardOptions<TBlueprint>
  ) {
    super(options.id, game, interceptors);
    this.game = game;
    this.originalPlayer = player;
    this.blueprint = options.blueprint as any;
    this.isFoil = options.isFoil;
    this.modifiers = new ModifierManager(game, this);
  }

  async init() {
    await this.blueprint.onInit(this.game, this as any);
  }

  get kind() {
    return this.blueprint.kind;
  }

  get keywords() {
    return this.keywordManager.keywords;
  }

  get player() {
    return this.interceptors.player.getValue(this.originalPlayer, {});
  }

  get blueprintId() {
    return this.blueprint.id;
  }

  get shouldPassInitiativeAfterPlay() {
    return this.interceptors.shouldPassInitiativeAfterPlay.getValue(true, {});
  }

  get location() {
    return this.player.cardManager.findCard(this.id)?.location;
  }

  get tags() {
    return this.blueprint.tags ?? [];
  }

  hasTag(tag: string) {
    return this.tags.includes(tag);
  }

  get jobs() {
    return this.blueprint.jobs;
  }

  hasJob(jobId: JobId) {
    return this.jobs.includes(jobId);
  }

  get manaCost(): number {
    if ('manaCost' in this.blueprint) {
      return this.interceptors.manaCost.getValue(this.blueprint.manaCost, {}) ?? 0;
    }
    return 0;
  }

  abstract removeFromBoard(): Promise<void>;

  async removeFromCurrentLocation() {
    if (!this.location) {
      return;
    }
    await match(this.location)
      .with(CARD_LOCATIONS.HAND, () => {
        this.player.cardManager.removeFromHand(this);
      })
      .with(CARD_LOCATIONS.DISCARD_PILE, () => {
        if (!isDeckCard(this)) {
          throw new IllegalGameStateError(
            `Cannot remove card ${this.id} from discard pile when it is not a deck card.`
          );
        }
        this.player.cardManager.removeFromDiscardPile(this);
      })
      .with(CARD_LOCATIONS.DECK, () => {
        if (!isDeckCard(this)) {
          throw new IllegalGameStateError(
            `Cannot remove card ${this.id} from main deck when it is not a main deck card.`
          );
        }
        this.player.cardManager.deck.pluck(this);
      })
      .with(CARD_LOCATIONS.BOARD, async () => {
        await this.removeFromBoard();
      })
      .exhaustive();
  }

  async sendToDiscardPile() {
    if (!isDeckCard(this)) {
      throw new IllegalGameStateError(
        `Cannot send card ${this.id} to discard pile when it is not a main deck card.`
      );
    }
    await this.removeFromCurrentLocation();
    this.player.cardManager.sendToDiscardPile(this);
  }

  async sendToBanishPile() {
    if (!isDeckCard(this)) {
      throw new IllegalGameStateError(
        `Cannot send card ${this.id} to banish pile when it is not a main deck card.`
      );
    }
    await this.removeFromCurrentLocation();
    this.player.cardManager.sendToBanishPile(this);
  }

  protected updatePlayedAt() {
    this.playedAtTurn = this.game.turnSystem.elapsedTurns;
  }

  get canReplace() {
    return this.interceptors.canReplace.getValue(true, {});
  }

  abstract canPlay(): boolean;

  abstract play(onCancel?: () => MaybePromise<void>): Promise<void>;

  protected serializeBase(): SerializedCard {
    return {
      id: this.id,
      art: this.blueprint.art.default,
      isFoil: this.isFoil,
      entityType: 'card',
      rarity: this.blueprint.rarity,
      player: this.player.id,
      kind: this.kind,
      name: this.blueprint.name,
      description: this.blueprint.description,
      canPlay: this.canPlay(),
      canReplace: this.canReplace,
      location: this.location ?? null,
      modifiers: this.modifiers.list.map(modifier => modifier.id),
      keywords: this.keywords.map(keyword => ({
        id: keyword.id,
        name: keyword.name,
        description: keyword.description
      })),
      jobs: this.jobs,
      spacesToHighlight: this.spacesToHighlight
    };
  }

  abstract serialize(): TSerialized;

  on(
    eventName: keyof CardEventMap,
    listener: (event: CardEventMap[keyof CardEventMap]) => void
  ) {
    return this.game.on(eventName, event => {
      if (event.data.card.equals(this)) {
        listener(event);
      }
    });
  }

  once(
    eventName: keyof CardEventMap,
    listener: (event: CardEventMap[keyof CardEventMap]) => void
  ) {
    return this.game.on(eventName, event => {
      if (event.data.card.equals(this)) {
        listener(event);
      }
    });
  }

  async discard() {
    if (!isDeckCard(this)) {
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

  async addToHand(index?: number) {
    if (!isDeckCard(this)) {
      throw new IllegalGameStateError(
        `Cannot add card ${this.id} to hand because it is not a main deck card.`
      );
    }
    await this.removeFromCurrentLocation();
    await this.player.cardManager.addToHand(this, index);
    await (this as this).game.emit(
      CARD_EVENTS.CARD_ADD_TO_HAND,
      new CardAddToHandevent({ card: this, index: index ?? null })
    );
  }

  isAlly(card: AnyCard) {
    return this.player.equals(card.player);
  }

  isEnemy(card: AnyCard) {
    return !this.isAlly(card);
  }
}
