import { BoardSide } from '../board/board-side.entity';
import { CardManagerComponent } from '../card/components/card-manager.component';
import { type Game } from '../game/game';
import { assert, type MaybePromise, type Serializable } from '@game/shared';
import type { AnyCard } from '../card/entities/card.entity';
import {
  NotEnoughCardsInDestinyZoneError,
  NotEnoughCardsInHandError
} from '../card/card-errors';
import { type HeroCard } from '../card/entities/hero.entity';
import { CardTrackerComponent } from './components/cards-tracker.component';
import { Interceptable } from '../utils/interceptable';
import { GAME_EVENTS } from '../game/game.events';
import { PlayerManaChangeEvent, PlayerTurnEvent } from './player.events';
import type { Ability, AbilityOwner } from '../card/entities/ability.entity';
import { GameError } from '../game/game-error';
import { CARD_KINDS } from '../card/card.enums';
import { HERO_EVENTS, HeroLevelUpEvent } from '../card/events/hero.events';
import { EntityWithModifiers } from '../modifier/entity-with-modifiers';
import { LockedModifier } from '../modifier/modifiers/locked.modifier';
import { cloneDeep } from 'lodash-es';

export type PlayerOptions = {
  id: string;
  name: string;
  mainDeck: { cards: string[] };
  destinyDeck: { cards: string[] };
};

export type SerializedPlayer = {
  id: string;
  entityType: 'player';
  name: string;
  hand: Array<{ cardId: string; isLocked: boolean; isRevealed: boolean }>;
  handSize: number;
  discardPile: string[];
  banishPile: string[];
  destinyZone: string[];
  remainingCardsInMainDeck: number;
  remainingCardsInDestinyDeck: number;
  canPerformResourceAction: boolean;
  remainingResourceActions: Record<PlayerResourceAction['type'], number>;
  maxResourceActionPerTurn: number;
  remainingTotalResourceActions: number;
  maxHp: number;
  currentHp: number;
  isPlayer1: boolean;
  maxMana: number;
  currentMana: number;
  manaRegen: number;
};

export type PlayerInterceptors = {
  cardsDrawnForTurn: Interceptable<number>;
  maxResourceActionPerTurn: Interceptable<number>;
  maxResourceActionsPerType: Interceptable<Record<PlayerResourceAction['type'], number>>;
  manaRegen: Interceptable<number>;
  maxManathreshold: Interceptable<number>;
  maxMana: Interceptable<number>;
};

const makeInterceptors = (): PlayerInterceptors => {
  return {
    cardsDrawnForTurn: new Interceptable(),
    maxResourceActionPerTurn: new Interceptable(),
    maxResourceActionsPerType: new Interceptable(),
    manaRegen: new Interceptable(),
    maxManathreshold: new Interceptable(),
    maxMana: new Interceptable()
  };
};

export type PlayerResourceAction = { type: 'rune' } | { type: 'draw' };

export class Player
  extends EntityWithModifiers<PlayerInterceptors>
  implements Serializable<SerializedPlayer>
{
  readonly boardSide: BoardSide;

  readonly cardManager: CardManagerComponent;

  readonly cardTracker: CardTrackerComponent;

  private _resourceActionsPerformedThisTurn: PlayerResourceAction[] = [];

  private _mana = 0;

  private _baseMaxMana = 0;

  hasPlayedDestinyCardThisTurn = false;

  private _hero!: {
    card: HeroCard;
    lineage: HeroCard[];
  };

  private options: PlayerOptions;

  constructor(game: Game, options: PlayerOptions) {
    super(options.id, game, makeInterceptors());
    this.options = cloneDeep(options);
    this.game = game;
    this.cardTracker = new CardTrackerComponent(game, this);
    this.boardSide = new BoardSide(this.game, this);
    this.cardManager = new CardManagerComponent(game, this, {
      maxHandSize: this.game.config.MAX_HAND_SIZE,
      shouldShuffleDeck: true
    });
  }

  async init() {
    const heroblueprint = this.options.destinyDeck.cards.find(cardId => {
      const blueprint = this.game.cardSystem.getBlueprint(cardId);
      return blueprint.kind === CARD_KINDS.HERO && blueprint.level === 0;
    });
    if (!heroblueprint) {
      throw new GameError(
        `No level 0 hero card found in destiny deck for player '${this.options.name}'`
      );
    }
    this.options.destinyDeck.cards = this.options.destinyDeck.cards.filter(
      cardId => cardId !== heroblueprint
    );

    this._hero = {
      card: await this.generateCard<HeroCard>(heroblueprint),
      lineage: []
    };
    await this.cardManager.init(
      this.options.mainDeck.cards,
      this.options.destinyDeck.cards
    );
    await this._hero.card.play();
    await this._hero.card.removeFromCurrentLocation();
  }

  async levelupHero(newHero: HeroCard) {
    const oldHero = this._hero.card;
    await this.game.emit(
      HERO_EVENTS.HERO_BEFORE_LEVEL_UP,
      new HeroLevelUpEvent({ from: oldHero, to: newHero })
    );

    this._hero.lineage.push(this._hero.card);
    this._hero = {
      card: newHero,
      lineage: this._hero.lineage
    };

    oldHero.removeFromCurrentLocation();
    newHero.cloneDamageTaken(oldHero);
    for (const modifier of oldHero.modifiers.list) {
      await modifier.remove();
      await this._hero.card.modifiers.add(modifier);
    }
    if (oldHero.isExhausted) {
      newHero.exhaustSilently();
    }
    await this.game.emit(
      HERO_EVENTS.HERO_AFTER_LEVEL_UP,
      new HeroLevelUpEvent({ from: oldHero, to: newHero })
    );
  }

  get resourceActionsPerformedThisTurn() {
    return [...this._resourceActionsPerformedThisTurn];
  }

  get cardsDrawnForTurn() {
    const isFirstTurn = this.game.turnSystem.elapsedTurns === 0;

    if (isFirstTurn) {
      return this.interceptors.cardsDrawnForTurn.getValue(
        this.game.interaction.isInteractive(this)
          ? this.game.config.PLAYER_1_CARDS_DRAWN_ON_FIRST_TURN
          : this.game.config.PLAYER_2_CARDS_DRAWN_ON_FIRST_TURN,
        {}
      );
    }

    return this.interceptors.cardsDrawnForTurn.getValue(
      this.game.config.CARDS_DRAWN_PER_TURN,
      {}
    );
  }

  get isPlayer1() {
    return this.game.playerSystem.player1.equals(this);
  }

  get opponent() {
    return this.game.playerSystem.players.find(p => !p.equals(this))!;
  }

  get hero() {
    return this._hero?.card;
  }

  get heroLinerage() {
    return this._hero.lineage;
  }

  get enemyHero() {
    return this.opponent.hero;
  }

  get minionsInBase() {
    return this.boardSide.base.minions;
  }

  get minionsInBattleField() {
    return this.boardSide.battlefield.minions;
  }

  get minions() {
    return [...this.minionsInBase, ...this.minionsInBattleField];
  }

  get allAllies() {
    return [this.hero, ...this.minions];
  }

  get allEnemies() {
    return [this.enemyHero, ...this.enemyMinions];
  }

  get enemyMinions() {
    return this.opponent.minions;
  }

  get isInteractive() {
    return this.game.interaction.isInteractive(this);
  }

  get influence() {
    return this.cardManager.hand.length + this.cardManager.destinyZone.size;
  }

  get maxResourceActionPerTurn() {
    return this.interceptors.maxResourceActionPerTurn.getValue(
      this.game.config.MAX_RESOURCE_ACTIONS_PER_TURN,
      {}
    );
  }

  getMaxResourceActionsPerType(actionType: PlayerResourceAction['type']): number {
    const defaultLimits: Record<PlayerResourceAction['type'], number> = {
      draw: this.game.config.MAX_RESOURCE_ACTIONS_PER_TURN,
      rune: this.game.config.MAX_RESOURCE_ACTIONS_PER_TURN
    };

    const limits = this.interceptors.maxResourceActionsPerType.getValue(
      defaultLimits,
      {}
    );

    return limits[actionType];
  }

  canPerformResourceActionOfType(actionType: PlayerResourceAction['type']): boolean {
    if (this._resourceActionsPerformedThisTurn.length >= this.maxResourceActionPerTurn) {
      return false;
    }

    // Check if the specific action type limit has been reached
    const maxForType = this.getMaxResourceActionsPerType(actionType);
    const performedCountForType = this._resourceActionsPerformedThisTurn.filter(
      a => a.type === actionType
    ).length;

    return performedCountForType < maxForType;
  }

  private async playCard(card: AnyCard) {
    await card.play();
    if (card.shouldSwitchInitiativeAfterPlay) {
      await this.game.turnSystem.switchInitiative();
    }
  }

  private async payForManaCost(manaCost: number, indices: number[]) {
    const hasEnough = this.cardManager.hand.length >= manaCost;
    assert(hasEnough, new NotEnoughCardsInHandError());
    const cards = this.cardManager.hand.filter((_, i) => indices.includes(i));
    for (const card of cards) {
      if (!card.canBeUsedAsManaCost) {
        throw new GameError(`Cannot use card '${card.id}' as mana cost`);
      }
      await card.sendToDestinyZone();
    }
  }

  async playMainDeckCard(card: AnyCard, manaCostIndices: number[]) {
    await this.payForManaCost(card.manaCost, manaCostIndices);
    card.isPlayedFromHand = true;
    await this.playCard(card);
  }

  async useAbility(
    ability: Ability<AbilityOwner>,
    manaCostIndices: number[],
    onResolved: () => MaybePromise<void>
  ) {
    await this.payForManaCost(ability.manaCost, manaCostIndices);
    await ability.use(onResolved);
  }

  async playDestinyDeckCard(card: AnyCard) {
    await this.payForDestinyCost(card.destinyCost);
    await this.playCard(card);
  }

  private async payForDestinyCost(cost: number) {
    const pool = [...this.cardManager.destinyZone].filter(
      card => card.canBeUsedAsDestinyCost
    );
    const hasEnough = pool.length >= cost;
    assert(hasEnough, new NotEnoughCardsInDestinyZoneError());

    const cardsToBanish: Array<{ card: AnyCard; index: number }> = [];
    for (let i = 0; i < cost; i++) {
      const index = this.game.rngSystem.nextInt(pool.length - 1);
      const card = pool[index];
      await card.sendToBanishPile();
      cardsToBanish.push({ card, index });
      pool.splice(index, 1);
    }
  }

  async startTurn() {
    await this.game.emit(
      GAME_EVENTS.PLAYER_START_TURN,
      new PlayerTurnEvent({ player: this })
    );
    this.hasPlayedDestinyCardThisTurn = false;
    this._resourceActionsPerformedThisTurn = [];
    for (const card of this.boardSide.getAllCardsInPlay()) {
      if (card.shouldWakeUpAtTurnStart) {
        await card.wakeUp();
      }
    }
  }

  generateCard<T extends AnyCard>(blueprintId: string) {
    const card = this.game.cardSystem.addCard<T>(this, blueprintId);

    return card;
  }

  refillMana() {
    this._mana = Math.min(this._mana + this.manaRegen, this.maxMana);
  }

  get mana() {
    return this._mana;
  }

  get maxMana() {
    return this.interceptors.maxMana.getValue(this._baseMaxMana, {});
  }

  get manaRegen() {
    return this.interceptors.manaRegen.getValue(this.game.config.MANA_REGEN_PER_TURN, {});
  }

  async spendMana(amount: number) {
    if (amount === 0) return;
    await this.game.emit(
      GAME_EVENTS.PLAYER_BEFORE_MANA_CHANGE,
      new PlayerManaChangeEvent({ player: this, amount })
    );
    this._mana = Math.max(this._mana - amount, 0);
    await this.game.emit(
      GAME_EVENTS.PLAYER_AFTER_MANA_CHANGE,
      new PlayerManaChangeEvent({ player: this, amount })
    );
  }

  async gainMana(amount: number) {
    if (amount === 0) return;
    await this.game.emit(
      GAME_EVENTS.PLAYER_BEFORE_MANA_CHANGE,
      new PlayerManaChangeEvent({ player: this, amount })
    );
    this._mana = this._mana + amount; // dont clamp to max mana because of effects that go over max mana (ex: mana tile)
    await this.game.emit(
      GAME_EVENTS.PLAYER_AFTER_MANA_CHANGE,
      new PlayerManaChangeEvent({ player: this, amount })
    );
  }

  canSpendMana(amount: number) {
    return this.mana >= amount;
  }

  serialize() {
    return {
      id: this.id,
      entityType: 'player' as const,
      name: this.options.name,
      hand: this.cardManager.hand.map(card => ({
        cardId: card.id,
        isLocked: card.modifiers.has(LockedModifier),
        isRevealed: card.isRevealed
      })),
      handSize: this.cardManager.hand.length,
      discardPile: [...this.cardManager.discardPile].map(card => card.id),
      banishPile: [...this.cardManager.banishPile].map(card => card.id),
      destinyZone: [...this.cardManager.destinyZone].map(card => card.id),
      remainingCardsInMainDeck: this.cardManager.mainDeck.cards.length,
      remainingCardsInDestinyDeck: this.cardManager.destinyDeck.cards.length,
      maxHp: this.hero.maxHp,
      currentHp: this.hero.remainingHp,
      isPlayer1: this.isPlayer1,
      canPerformResourceAction:
        this._resourceActionsPerformedThisTurn.length < this.maxResourceActionPerTurn,
      remainingResourceActions: {
        draw:
          this.getMaxResourceActionsPerType('draw') -
          this._resourceActionsPerformedThisTurn.filter(a => a.type === 'draw').length,
        rune:
          this.getMaxResourceActionsPerType('rune') -
          this._resourceActionsPerformedThisTurn.filter(a => a.type === 'rune').length
      },
      remainingTotalResourceActions:
        this.maxResourceActionPerTurn - this._resourceActionsPerformedThisTurn.length,
      maxResourceActionPerTurn: this.maxResourceActionPerTurn,
      currentMana: this._mana,
      maxMana: this.maxMana,
      manaRegen: this.manaRegen
    };
  }
}
