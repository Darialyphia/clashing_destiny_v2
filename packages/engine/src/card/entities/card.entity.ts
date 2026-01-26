import { type JSONObject, type MaybePromise } from '@game/shared';
import { nanoid } from 'nanoid';
import type { Game } from '../../game/game';
import type { Player } from '../../player/player.entity';
import { Interceptable } from '../../utils/interceptable';
import type { CardBlueprint, PreResponseTarget } from '../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_EVENTS,
  CARD_SPEED,
  type CardDeckSource,
  type CardKind,
  type CardSpeed,
  type Rarity,
  CARD_LOCATIONS,
  type CardLocation,
  FACTIONS
} from '../card.enums';
import {
  CardAddToHandevent,
  CardAfterDestroyEvent,
  CardAfterPlayEvent,
  CardBeforeDestroyEvent,
  CardBeforePlayEvent,
  CardChangeLocationEvent,
  CardDiscardEvent,
  CardDisposedEvent,
  CardExhaustEvent,
  CardRevealEvent,
  CardWakeUpEvent
} from '../card.events';
import { match } from 'ts-pattern';
import { KeywordManagerComponent } from '../components/keyword-manager.component';
import { IllegalGameStateError } from '../../game/game-error';
import { isMainDeckCard } from '../../board/board.system';
import { COMBAT_STEPS, EFFECT_TYPE, GAME_PHASES } from '../../game/game.enums';
import { EntityWithModifiers } from '../../modifier/entity-with-modifiers';
import type { AbilityOwner } from './ability.entity';
import { LockedModifier } from '../../modifier/modifiers/locked.modifier';

export type CardOptions<T extends CardBlueprint = CardBlueprint> = {
  id: string;
  blueprint: T;
};

export type AnyCard = Card<any, any, any>;
export type CardInterceptors = {
  manaCost: Interceptable<number | null>;
  destinyCost: Interceptable<number | null>;
  player: Interceptable<Player>;
  loyalty: Interceptable<number>;
  canBeUsedAsDestinyCost: Interceptable<boolean>;
  canBeUsedAsManaCost: Interceptable<boolean>;
  canBeRecollected: Interceptable<boolean>;
  speed: Interceptable<CardSpeed>;
  deckSource: Interceptable<CardDeckSource>;
  shouldWakeUpAtTurnStart: Interceptable<boolean>;
  loyaltyManaCostIncrease: Interceptable<number>;
  loyaltyDestinyCostIncrease: Interceptable<number>;
  loyaltyHpCost: Interceptable<number>;
};

export const makeCardInterceptors = (): CardInterceptors => ({
  manaCost: new Interceptable(),
  destinyCost: new Interceptable(),
  player: new Interceptable(),
  loyalty: new Interceptable(),
  canBeUsedAsDestinyCost: new Interceptable(),
  canBeUsedAsManaCost: new Interceptable(),
  canBeRecollected: new Interceptable(),
  speed: new Interceptable(),
  deckSource: new Interceptable(),
  shouldWakeUpAtTurnStart: new Interceptable(),
  loyaltyManaCostIncrease: new Interceptable(),
  loyaltyDestinyCostIncrease: new Interceptable(),
  loyaltyHpCost: new Interceptable()
});

export type SerializedCard = {
  id: string;
  entityType: 'card';
  art: CardBlueprint['art'][string];
  kind: CardKind;
  rarity: Rarity;
  player: string;
  isExhausted: boolean;
  name: string;
  description: string;
  canPlay: boolean;
  source: CardDeckSource;
  location: CardLocation | null;
  speed: CardSpeed;
  modifiers: string[];
  canBeUsedAsManaCost: boolean;
  manaCost: number | null;
  destinyCost: number | null;
  keywords: string[];
  faction: string;
  unplayableReason: string | null;
  isRevealed: boolean;
};

export type CardTargetOrigin =
  | { type: 'card'; card: AnyCard }
  | {
      type: 'ability';
      abilityId: string;
      card: AbilityOwner;
    };

export abstract class Card<
  TSerialized extends JSONObject,
  TInterceptors extends CardInterceptors = CardInterceptors,
  TBlueprint extends CardBlueprint = CardBlueprint
> extends EntityWithModifiers<TInterceptors> {
  blueprint: TBlueprint;

  protected originalPlayer: Player;

  protected _isExhausted = false;

  readonly keywordManager = new KeywordManagerComponent();

  protected playedAtTurn: number | null = null;

  protected _targetedBy: CardTargetOrigin[] = [];

  protected _isRevealed = false;

  isPlayedFromHand = false;

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
  }

  async init() {
    await this.blueprint.onInit(this.game, this as any);
  }

  get kind() {
    return this.blueprint.kind;
  }

  get faction() {
    return this.blueprint.faction;
  }

  get keywords() {
    return this.keywordManager.keywords;
  }

  get player() {
    return this.interceptors.player.getValue(this.originalPlayer, {});
  }

  get deckSource() {
    return this.interceptors.deckSource.getValue(this.blueprint.deckSource, {});
  }

  get isMainDeckCard() {
    return this.deckSource === CARD_DECK_SOURCES.MAIN_DECK;
  }

  get isDestinyDeckCard() {
    return this.deckSource === CARD_DECK_SOURCES.DESTINY_DECK;
  }

  get isRevealed() {
    return this._isRevealed;
  }

  async reveal() {
    if (this.isRevealed) return;
    await this.game.emit(
      CARD_EVENTS.CARD_BEFORE_REVEAL,
      new CardRevealEvent({ card: this })
    );
    this._isRevealed = true;
    await this.game.emit(
      CARD_EVENTS.CARD_AFTER_REVEAL,
      new CardRevealEvent({ card: this })
    );
  }

  async hide() {
    if (!this.isRevealed) return;
    this._isRevealed = false;
  }

  get blueprintId() {
    return this.blueprint.id;
  }

  get isExhausted() {
    return this._isExhausted;
  }

  get shouldWakeUpAtTurnStart() {
    return this.interceptors.shouldWakeUpAtTurnStart.getValue(true, {});
  }

  get location() {
    return this.player.cardManager.findCard(this.id)?.location;
  }

  get tags() {
    return this.blueprint.tags ?? [];
  }

  get loyaltyManaCostIncrease() {
    return this.interceptors.loyaltyManaCostIncrease.getValue(
      this.game.config.BASE_LOYALTY_COST_INCREASE,
      {}
    );
  }

  get loyaltyDestinyCostIncrease() {
    return this.interceptors.loyaltyDestinyCostIncrease.getValue(
      this.game.config.BASE_LOYALTY_COST_INCREASE,
      {}
    );
  }

  get loyaltyHpCost() {
    return this.interceptors.loyaltyHpCost.getValue(
      this.game.config.BASE_LOYALTY_HP_COST,
      {}
    );
  }

  get manaCost(): number {
    if ('manaCost' in this.blueprint) {
      const loyaltyCost =
        this.faction.id === this.player.hero.faction.id ||
        this.faction.id === FACTIONS.NEUTRAL.id
          ? 0
          : this.loyaltyManaCostIncrease;

      return Math.max(
        0,
        this.interceptors.manaCost.getValue(this.blueprint.manaCost + loyaltyCost, {}) ??
          0
      );
    }
    return 0;
  }

  get canPayManaCost() {
    return (
      this.player.cardManager.hand.filter(card => !card.equals(this)).length >=
      this.manaCost
    );
  }

  get destinyCost(): number {
    if ('destinyCost' in this.blueprint) {
      const loyaltyCost =
        this.faction.id === this.player.hero.faction.id ||
        this.faction.id === FACTIONS.NEUTRAL.id
          ? 0
          : this.loyaltyManaCostIncrease;

      return (
        this.interceptors.destinyCost.getValue(
          this.blueprint.destinyCost + loyaltyCost,
          {}
        ) ?? 0
      );
    }
    return 0;
  }

  get canPayDestinyCost() {
    const pool = Array.from(this.player.cardManager.discardPile)
      .filter(card => card.canBeUsedAsDestinyCost)
      .concat([...this.player.cardManager.destinyZone]);

    return pool.length >= this.destinyCost;
  }

  get canBeUsedAsDestinyCost() {
    return this.interceptors.canBeUsedAsDestinyCost.getValue(false, {});
  }

  get canBeUsedAsManaCost() {
    return this.interceptors.canBeUsedAsManaCost.getValue(true, {});
  }

  get canBeRecollected() {
    return this.interceptors.canBeRecollected.getValue(true, {});
  }

  get targetedBy() {
    return this._targetedBy;
  }

  get speed() {
    return this.interceptors.speed.getValue(this.blueprint.speed, {});
  }

  get canPlayDuringChain() {
    return this.speed !== CARD_SPEED.SLOW;
  }

  protected async dispose() {
    await match(this.deckSource)
      .with(CARD_DECK_SOURCES.MAIN_DECK, async () => {
        await this.sendToDiscardPile();
      })
      .with(CARD_DECK_SOURCES.DESTINY_DECK, async () => {
        await this.sendToBanishPile();
      })
      .exhaustive();
    await this.game.emit(
      CARD_EVENTS.CARD_DISPOSED,
      new CardDisposedEvent({ card: this })
    );
  }

  async resolve(handler: () => Promise<void>) {
    await this.game.emit(
      CARD_EVENTS.CARD_BEFORE_PLAY,
      new CardBeforePlayEvent({ card: this })
    );
    this.updatePlayedAt();

    await handler();

    await this.game.emit(
      CARD_EVENTS.CARD_AFTER_PLAY,
      new CardAfterPlayEvent({ card: this })
    );
  }

  protected async insertInChainOrExecute(
    handler: () => Promise<void>,
    options: {
      targets: PreResponseTarget[];
      onResolved?: () => MaybePromise<void>;
    }
  ) {
    const effect = {
      id: nanoid(),
      type: EFFECT_TYPE.CARD,
      source: this,
      targets: options.targets,
      handler: async () => {
        await this.resolve(handler);
        this.isPlayedFromHand = false;
      }
    };

    if (this.speed === CARD_SPEED.BURST) {
      await effect.handler();
      return this.game.inputSystem.askForPlayerInput();
    }
    if (this.game.effectChainSystem.currentChain) {
      if (this.game.effectChainSystem.currentChain.canAddEffect(this.player)) {
        await this.game.effectChainSystem.addEffect(effect, this.player);
      } else {
        // this can happen if a card is played as part of an other card effect
        // the card wiill be played while the current chain is resolving, so let's just execute it immediately
        await effect.handler();
        return this.game.inputSystem.askForPlayerInput();
      }
    } else {
      await this.game.effectChainSystem.createChain({
        initialPlayer: this.player,
        initialEffect: effect,
        onResolved: options.onResolved
      });
    }
  }

  targetBy(origin: CardTargetOrigin) {
    this._targetedBy.push(origin);
  }

  clearTargetedBy(origin: CardTargetOrigin) {
    this._targetedBy = this._targetedBy.filter(t =>
      match(t)
        .with(
          { type: 'ability' },
          t =>
            (origin.type === 'ability' && t.abilityId !== origin.abilityId) ||
            !t.card.equals(origin.card)
        )
        .with(
          { type: 'card' },
          t => origin.type === 'card' && !t.card.equals(origin.card)
        )
        .exhaustive()
    );
  }

  removeFromCurrentLocation() {
    if (!this.location) {
      return;
    }
    this.interceptors.player.clear();
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
        this.player.cardManager.removeFromDestinyDeck(this);
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
        this.player.boardSide.remove(this);
      })
      .exhaustive();
  }

  async sendToDiscardPile() {
    if (!isMainDeckCard(this)) {
      throw new IllegalGameStateError(
        `Cannot send card ${this.id} to discard pile when it is not a main deck card.`
      );
    }
    const currentLocation = this.location ?? null;
    await this.game.emit(
      CARD_EVENTS.CARD_BEFORE_CHANGE_LOCATION,
      new CardChangeLocationEvent({
        card: this,
        to: CARD_LOCATIONS.DISCARD_PILE,
        from: currentLocation
      })
    );
    this.removeFromCurrentLocation();
    this.originalPlayer.cardManager.sendToDiscardPile(this);
    await this.game.emit(
      CARD_EVENTS.CARD_AFTER_CHANGE_LOCATION,
      new CardChangeLocationEvent({
        card: this,
        to: CARD_LOCATIONS.DISCARD_PILE,
        from: currentLocation
      })
    );
  }

  async sendToBanishPile() {
    const currentLocation = this.location ?? null;
    await this.game.emit(
      CARD_EVENTS.CARD_BEFORE_CHANGE_LOCATION,
      new CardChangeLocationEvent({
        card: this,
        to: CARD_LOCATIONS.BANISH_PILE,
        from: currentLocation
      })
    );
    this.removeFromCurrentLocation();
    this.originalPlayer.cardManager.sendToBanishPile(this);
    await this.game.emit(
      CARD_EVENTS.CARD_AFTER_CHANGE_LOCATION,
      new CardChangeLocationEvent({
        card: this,
        to: CARD_LOCATIONS.BANISH_PILE,
        from: currentLocation
      })
    );
  }

  async sendToDestinyZone() {
    if (!isMainDeckCard(this)) {
      throw new IllegalGameStateError(
        `Cannot send card ${this.id} to destiny zone when it is not a main deck card.`
      );
    }
    const currentLocation = this.location ?? null;
    await this.game.emit(
      CARD_EVENTS.CARD_BEFORE_CHANGE_LOCATION,
      new CardChangeLocationEvent({
        card: this,
        to: CARD_LOCATIONS.DESTINY_ZONE,
        from: currentLocation
      })
    );
    this.removeFromCurrentLocation();
    this.originalPlayer.cardManager.sendToDestinyZone(this);
    await this.game.emit(
      CARD_EVENTS.CARD_AFTER_CHANGE_LOCATION,
      new CardChangeLocationEvent({
        card: this,
        to: CARD_LOCATIONS.DESTINY_ZONE,
        from: currentLocation
      })
    );
  }

  protected updatePlayedAt() {
    this.playedAtTurn = this.game.turnSystem.elapsedTurns;
  }
  abstract canPlay(): boolean;

  protected get canPlayAsMaindeckCard() {
    if (this.deckSource !== CARD_DECK_SOURCES.MAIN_DECK) {
      return false;
    }
    return this.location === CARD_LOCATIONS.HAND && this.canPayManaCost;
  }

  protected get canPlayAsDestinyDeckCard() {
    if (this.deckSource !== CARD_DECK_SOURCES.DESTINY_DECK) {
      return false;
    }
    if (this.player.hasPlayedDestinyCardThisTurn) {
      return false;
    }

    return (
      this.location === CARD_LOCATIONS.DESTINY_DECK &&
      this.canPayDestinyCost &&
      this.game.turnSystem.elapsedTurns >=
        this.game.config.MINIMUM_TURN_COUNT_TO_PLAY_DESTINY_CARD
    );
  }

  get isIncombatPhaseBeforeChain() {
    const gameStateCtx = this.game.gamePhaseSystem.getContext();
    if (
      gameStateCtx.state === GAME_PHASES.ATTACK &&
      gameStateCtx.ctx.step !== COMBAT_STEPS.BUILDING_CHAIN
    ) {
      return true;
    }

    return false;
  }

  protected get canPlayBase() {
    if (this.isIncombatPhaseBeforeChain) {
      return false;
    }

    if (this.game.effectChainSystem.currentChain && !this.canPlayDuringChain) {
      return false;
    }

    return match(this.deckSource)
      .with(CARD_DECK_SOURCES.MAIN_DECK, () => this.canPlayAsMaindeckCard)
      .with(CARD_DECK_SOURCES.DESTINY_DECK, () => this.canPlayAsDestinyDeckCard)
      .exhaustive();
  }

  get unplayableReason(): string | null {
    if (this.canPlay()) {
      return null;
    }

    if (this.isIncombatPhaseBeforeChain) {
      return 'You need to declare the attack target before playing cards.';
    }

    if (this.game.effectChainSystem.currentChain && !this.canPlayDuringChain) {
      return "Can't play during an effect chain.";
    }

    return match(this.deckSource)
      .with(CARD_DECK_SOURCES.MAIN_DECK, () => {
        if (this.location !== CARD_LOCATIONS.HAND) {
          return null; // we avoid sending a message as it wont be used client side and this allows us to drastically reduce game snapshot size
        }
        if (!this.canPayManaCost) {
          return 'Cannot pay mana cost.';
        }
        return 'You cannot play this card';
      })
      .with(CARD_DECK_SOURCES.DESTINY_DECK, () => {
        if (this.player.hasPlayedDestinyCardThisTurn) {
          return 'You have already played a Destiny card this turn.';
        }
        if (this.location !== CARD_LOCATIONS.DESTINY_DECK) {
          return null; // we avoid sending a message as it wont be used client side and this allows us to drastically reduce game snapshot size
        }
        if (!this.canPayDestinyCost) {
          return 'Cannot pay destiny cost.';
        }
        if (
          this.game.turnSystem.elapsedTurns <
          this.game.config.MINIMUM_TURN_COUNT_TO_PLAY_DESTINY_CARD
        ) {
          return `Cannot play destiny cards yet.`;
        }
        return 'You cannot play this card.';
      })
      .exhaustive();
  }

  abstract play(onResolved: () => MaybePromise<void>): Promise<void>;

  protected serializeBase(): SerializedCard {
    return {
      id: this.id,
      art: this.blueprint.art.default,
      source: this.deckSource,
      entityType: 'card',
      rarity: this.blueprint.rarity,
      player: this.player.id,
      kind: this.kind,
      isExhausted: this.isExhausted,
      faction: this.faction.id,
      name: this.blueprint.name,
      description: this.blueprint.description,
      canPlay: this.canPlay(),
      location: this.location ?? null,
      canBeUsedAsManaCost: this.canBeUsedAsManaCost,
      modifiers: this.modifiers.list
        .filter(mod => mod.isEnabled)
        .map(modifier => modifier.id),
      manaCost: this.deckSource === CARD_DECK_SOURCES.MAIN_DECK ? this.manaCost : null,
      destinyCost:
        this.deckSource === CARD_DECK_SOURCES.DESTINY_DECK ? this.destinyCost : null,
      speed: this.blueprint.speed,
      keywords: this.keywords.map(keyword => keyword.id),
      unplayableReason: this.unplayableReason,
      isRevealed: this.isRevealed
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

  async addToHand(index?: number) {
    if (!isMainDeckCard(this)) {
      throw new IllegalGameStateError(
        `Cannot add card ${this.id} to hand because it is not a main deck card.`
      );
    }
    const currentLocation = this.location ?? null;
    await this.game.emit(
      CARD_EVENTS.CARD_BEFORE_CHANGE_LOCATION,
      new CardChangeLocationEvent({
        card: this,
        to: CARD_LOCATIONS.HAND,
        from: currentLocation
      })
    );
    this.removeFromCurrentLocation();
    await this.player.cardManager.addToHand(this, index);
    await (this as this).game.emit(
      CARD_EVENTS.CARD_ADD_TO_HAND,
      new CardAddToHandevent({ card: this, index: index ?? null })
    );
    await this.game.emit(
      CARD_EVENTS.CARD_AFTER_CHANGE_LOCATION,
      new CardChangeLocationEvent({
        card: this,
        to: CARD_LOCATIONS.HAND,
        from: currentLocation
      })
    );
  }

  async exhaust() {
    if (this.isExhausted) return;
    await this.game.emit(CARD_EVENTS.CARD_EXHAUST, new CardExhaustEvent({ card: this }));
    this._isExhausted = true;
  }

  exhaustSilently() {
    this._isExhausted = true;
  }

  async wakeUp() {
    if (!this.isExhausted) return;
    await this.game.emit(CARD_EVENTS.CARD_WAKE_UP, new CardWakeUpEvent({ card: this }));
    this._isExhausted = false;
  }

  async destroy(source: AnyCard) {
    await this.game.emit(
      CARD_EVENTS.CARD_BEFORE_DESTROY,
      new CardBeforeDestroyEvent({ card: this, source })
    );

    this._isExhausted = false;

    await this.dispose();
    await this.game.emit(
      CARD_EVENTS.CARD_AFTER_DESTROY,
      new CardAfterDestroyEvent({ card: this, source })
    );
  }

  isAlly(card: AnyCard | Player) {
    if (card instanceof Card) {
      return this.player.equals(card.player);
    }
    return this.player.equals(card);
  }

  isEnemy(card: AnyCard | Player) {
    return !this.isAlly(card);
  }
}
