import { isFunction, type JSONObject, type MaybePromise } from '@game/shared';
import type { Game } from '../../game/game';
import type { Player } from '../../player/player.entity';
import { Interceptable } from '../../utils/interceptable';
import type { CardBlueprint, Targets } from '../card-blueprint';
import {
  CARD_EVENTS,
  type CardKind,
  type Rarity,
  CARD_LOCATIONS,
  type CardLocation,
  CARD_KINDS,
  type Affinity,
  AFFINITIES,
  type JobId,
  type CardSpeed,
  CARD_SPEED
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
import { EntityWithModifiers } from '../../modifier/entity-with-modifiers';
import { COMBAT_STEPS, EFFECT_TYPE, INTERACTION_STATES } from '../../game/game.enums';
import { nanoid } from 'nanoid';
import type { BoardSpace } from '../../board/board-space.entity';

export type CardOptions<T extends CardBlueprint = CardBlueprint> = {
  id: string;
  blueprint: T;
  isFoil: boolean;
};

export type AnyCard = Card<any, any, any>;
export type CardInterceptors = {
  manaCost: Interceptable<number | null>;
  player: Interceptable<Player>;
  loyalty: Interceptable<number>;
  shouldWakeUpAtTurnStart: Interceptable<boolean>;
  shouldSwitchInitiativeAfterPlay: Interceptable<boolean>;
  playerLevel: Interceptable<number>;
  offFactionManaCostIncrease: Interceptable<number>;
  speed: Interceptable<CardSpeed>;
  shouldCreateChainWhenPlayed: Interceptable<boolean, AnyCard>;
};

export const makeCardInterceptors = (): CardInterceptors => ({
  manaCost: new Interceptable(),
  player: new Interceptable(),
  loyalty: new Interceptable(),
  shouldWakeUpAtTurnStart: new Interceptable(),
  shouldSwitchInitiativeAfterPlay: new Interceptable(),
  playerLevel: new Interceptable(),
  offFactionManaCostIncrease: new Interceptable(),
  speed: new Interceptable(),
  shouldCreateChainWhenPlayed: new Interceptable()
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
  location: CardLocation | null;
  modifiers: string[];
  manaCost: number | null;
  keywords: string[];
  unplayableReason: string | null;
  isRevealed: boolean;
  affinities: Affinity[];
  position: string | null;
  speed: CardSpeed;
  isFoil: boolean;
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

  protected _isRevealed = false;

  isPlayedFromHand = false;

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
  }

  async init() {
    await this.blueprint.onInit(this.game, this as any);
  }

  async copy() {
    const copy = await this.player.generateCard(this.blueprintId, this.isFoil);
    return copy;
  }

  get kind() {
    return this.blueprint.kind;
  }

  get jobs() {
    return this.blueprint.jobs;
  }

  hasJob(jobId: JobId) {
    return this.jobs.map(j => j.id).includes(jobId);
  }

  get keywords() {
    return this.keywordManager.keywords;
  }

  get player() {
    return this.interceptors.player.getValue(this.originalPlayer, {});
  }

  get isRevealed() {
    return this._isRevealed;
  }

  get affinities() {
    return this.blueprint.affinities;
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

  get shouldSwitchInitiativeAfterPlay() {
    return this.interceptors.shouldSwitchInitiativeAfterPlay.getValue(true, {});
  }

  get location() {
    return this.player.cardManager.findCard(this.id)?.location;
  }

  get tags() {
    return this.blueprint.tags ?? [];
  }

  get manaCost(): number {
    if ('manaCost' in this.blueprint) {
      const base = this.blueprint.manaCost;

      return Math.max(0, this.interceptors.manaCost.getValue(base ?? null, {}) ?? 0);
    }
    return 0;
  }

  get canPayManaCost() {
    return this.player.mana >= this.manaCost;
  }

  get position(): BoardSpace | null {
    return (
      [
        ...this.player.boardSide.base,
        ...this.player.boardSide.leftBattlefield.spaces,
        ...this.player.boardSide.rightBattlefield.spaces
      ].find(space => space.card?.equals(this)) ?? null
    );
  }

  get hasUnlockedAffinity() {
    if (this.affinities[0] === AFFINITIES.NEUTRAL) {
      return true;
    }
    return this.affinities.some(affinity =>
      this.player.unlockedAffinities.includes(affinity)
    );
  }

  protected async dispose() {
    await match(this.kind)
      .with(CARD_KINDS.MINION, CARD_KINDS.SPELL, CARD_KINDS.ARTIFACT, async () => {
        await this.sendToDiscardPile();
      })
      .with(CARD_KINDS.HERO, CARD_KINDS.DESTINY, async () => {
        await this.sendToBanishPile();
      })
      .exhaustive();

    await this.game.emit(
      CARD_EVENTS.CARD_DISPOSED,
      new CardDisposedEvent({ card: this })
    );
  }

  get shouldCreateChainWhenPlayed(): boolean {
    return this.interceptors.shouldCreateChainWhenPlayed.getValue(true, this);
  }

  protected async insertInChainOrExecute(
    handler: () => Promise<void>,
    options: {
      targets: Targets<AnyCard>;
      onResolved?: () => MaybePromise<void>;
    }
  ) {
    const effect = {
      id: `effect-${this.game.effectChainSystem.currentChain?.stack.length ?? 0}-${nanoid(4)}`,
      type: EFFECT_TYPE.CARD,
      source: this,
      targets: options.targets,
      handler: async () => {
        await this.resolve(handler);
        this.isPlayedFromHand = false;
      }
    };

    if (!this.shouldCreateChainWhenPlayed) {
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

  removeFromCurrentLocation() {
    if (!this.location) {
      return;
    }
    this.interceptors.player.clear();
    match(this.location)
      .with(CARD_LOCATIONS.HAND, () => {
        this.player.cardManager.removeFromHand(this);
      })
      .with(CARD_LOCATIONS.DISCARD_PILE, () => {
        this.player.cardManager.removeFromDiscardPile(this);
      })
      .with(CARD_LOCATIONS.BANISH_PILE, () => {
        this.player.cardManager.removeFromBanishPile(this);
      })
      .with(CARD_LOCATIONS.MAIN_DECK, () => {
        this.player.cardManager.mainDeck.pluck(this);
      })
      .with(CARD_LOCATIONS.DESTINY_DECK, () => {
        this.player.cardManager.destinyDeck.pluck(this as any);
      })
      .with(
        CARD_LOCATIONS.BASE,
        CARD_LOCATIONS.LEFT_BATTLEFIELD,
        CARD_LOCATIONS.RIGHT_BATTLEFIELD,
        () => {
          this.player.boardSide.remove(this);
        }
      )
      .exhaustive();
  }

  async sendToDiscardPile() {
    await this.changeLocation(CARD_LOCATIONS.DISCARD_PILE, () =>
      this.originalPlayer.cardManager.sendToDiscardPile(this)
    );
  }

  async sendToBanishPile() {
    await this.changeLocation(CARD_LOCATIONS.BANISH_PILE, () =>
      this.originalPlayer.cardManager.sendToBanishPile(this)
    );
  }

  async sendToTopOfDeck() {
    await this.changeLocation(CARD_LOCATIONS.MAIN_DECK, () =>
      this.player.cardManager.mainDeck.addToTop(this)
    );
  }

  async sendToBottomOfDeck() {
    await this.changeLocation(CARD_LOCATIONS.MAIN_DECK, () =>
      this.player.cardManager.mainDeck.addToBottom(this)
    );
  }

  async shuffleIntoDeck() {
    await this.changeLocation(CARD_LOCATIONS.MAIN_DECK, () =>
      this.player.cardManager.mainDeck.addAtRandomPosition(this)
    );
  }

  protected async changeLocation(
    to: CardLocation,
    move: () => MaybePromise<void>,
    options: { removeBeforeMove?: boolean } = {}
  ) {
    const { removeBeforeMove = true } = options;
    const from = this.location ?? null;
    await this.game.emit(
      CARD_EVENTS.CARD_BEFORE_CHANGE_LOCATION,
      new CardChangeLocationEvent({ card: this, to, from })
    );
    if (removeBeforeMove) this.removeFromCurrentLocation();
    await move();
    await this.game.emit(
      CARD_EVENTS.CARD_AFTER_CHANGE_LOCATION,
      new CardChangeLocationEvent({ card: this, to, from })
    );
  }

  protected updatePlayedAt() {
    this.playedAtTurn = this.game.turnSystem.elapsedTurns;
  }

  get isIncombatPhaseBeforeChain() {
    return this.game.combatSystem.state === COMBAT_STEPS.DECLARE_TARGET;
  }

  get speed() {
    return this.interceptors.speed.getValue(this.blueprint.speed, {});
  }

  get canPlayDuringChain() {
    return this.speed === CARD_SPEED.FAST;
  }

  protected get canPlayBase() {
    if (this.isIncombatPhaseBeforeChain) {
      return false;
    }

    if (this.game.effectChainSystem.currentChain && !this.canPlayDuringChain) {
      return false;
    }

    if (this.game.interaction.getState() !== INTERACTION_STATES.IDLE) {
      return false;
    }

    return this.location === CARD_LOCATIONS.HAND && this.canPayManaCost;
  }

  abstract canPlay(): boolean;

  get unplayableReason(): string | null {
    if (this.canPlay()) {
      return null;
    }

    if (this.location !== CARD_LOCATIONS.HAND) {
      return null; // we avoid sending a message as it wont be used client side and this allows us to drastically reduce game snapshot size
    }

    if (this.isIncombatPhaseBeforeChain) {
      return 'You need to declare the attack target before playing cards.';
    }

    if (this.game.effectChainSystem.currentChain && !this.canPlayDuringChain) {
      return "Can't play during an effect chain.";
    }

    if (this.game.interaction.getState() !== INTERACTION_STATES.IDLE) {
      return 'You cannot play cards from hand right now.';
    }

    if (!this.canPayManaCost) {
      return 'Cannot pay mana cost.';
    }
    return 'You cannot play this card';
  }

  abstract play(): Promise<{ cancelled: boolean }>;

  get description() {
    return isFunction(this.blueprint.description)
      ? this.blueprint.description()
      : this.blueprint.description;
  }

  protected serializeBase(): SerializedCard {
    return {
      id: this.id,
      isFoil: this.isFoil,
      art: this.blueprint.art.default,
      entityType: 'card',
      rarity: this.blueprint.rarity,
      player: this.player.id,
      kind: this.kind,
      isExhausted: this.isExhausted,
      name: this.blueprint.name,
      description:
        this.blueprint?.dynamicDescription?.(this.game, this) ?? this.description,
      canPlay: this.canPlay(),
      location: this.location ?? null,
      modifiers: this.modifiers.list
        .filter(mod => mod.isEnabled)
        .map(modifier => modifier.id),
      manaCost: 'manaCost' in this.blueprint ? this.manaCost : null,
      keywords: this.keywords.map(keyword => keyword.id),
      unplayableReason: this.unplayableReason,
      isRevealed: this.isRevealed,
      affinities: this.affinities,
      position: this.position?.id ?? null,
      speed: this.speed
    };
  }

  abstract serialize(): TSerialized;

  async discard() {
    await (this as this).game.emit(
      CARD_EVENTS.CARD_DISCARD,
      new CardDiscardEvent({ card: this })
    );
    this.player.cardManager.discard(this);
  }

  async addToHand(index?: number) {
    await this.changeLocation(CARD_LOCATIONS.HAND, async () => {
      await this.player.cardManager.addToHand(this, index);
      await this.game.emit(
        CARD_EVENTS.CARD_ADD_TO_HAND,
        new CardAddToHandevent({ card: this, index: index ?? null })
      );
    });
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
