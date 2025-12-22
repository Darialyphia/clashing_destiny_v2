import { BoardSide } from '../board/board-side.entity';
import { CardManagerComponent } from '../card/components/card-manager.component';
import { Entity } from '../entity';
import { type Game } from '../game/game';
import {
  assert,
  isDefined,
  uppercaseFirstLetter,
  type MaybePromise,
  type Serializable
} from '@game/shared';
import { ArtifactManagerComponent } from './components/artifact-manager.component';
import type { AnyCard } from '../card/entities/card.entity';
import {
  NotEnoughCardsInDestinyZoneError,
  NotEnoughCardsInHandError
} from '../card/card-errors';
import { type HeroCard } from '../card/entities/hero.entity';
import { CardTrackerComponent } from './components/cards-tracker.component';
import { Interceptable } from '../utils/interceptable';
import { GAME_EVENTS } from '../game/game.events';
import {
  PlayerGainRuneEvent,
  PlayerPayForDestinyCostEvent,
  PlayerSpendRuneEvent,
  PlayerTurnEvent
} from './player.events';
import { ModifierManager } from '../modifier/modifier-manager.component';
import type { Ability, AbilityOwner } from '../card/entities/ability.entity';
import { GameError } from '../game/game-error';
import type { RuneCost } from '../card/card-blueprint';
import { CARD_KINDS, RUNES, type Rune } from '../card/card.enums';
import { match } from 'ts-pattern';
import { UnpreventableDamage } from '../utils/damage';
import { HERO_EVENTS, HeroLevelUpEvent } from '../card/events/hero.events';
import { max } from 'lodash-es';

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
  hand: string[];
  handSize: number;
  influence: number;
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
  unlockedRunes: RuneCost;
};

export type PlayerInterceptors = {
  cardsDrawnForTurn: Interceptable<number>;
  maxResourceActionPerTurn: Interceptable<number>;
  maxResourceActionsPerType: Interceptable<Record<PlayerResourceAction['type'], number>>;
};
const makeInterceptors = (): PlayerInterceptors => {
  return {
    cardsDrawnForTurn: new Interceptable<number>(),
    maxResourceActionPerTurn: new Interceptable<number>(),
    maxResourceActionsPerType: new Interceptable<
      Record<PlayerResourceAction['type'], number>
    >()
  };
};

export type PlayerResourceAction =
  | { type: 'gain_rune'; rune: Rune }
  | { type: 'draw_card' };

export class Player
  extends Entity<PlayerInterceptors>
  implements Serializable<SerializedPlayer>
{
  private game: Game;

  readonly boardSide: BoardSide;

  readonly cardManager: CardManagerComponent;

  readonly modifiers: ModifierManager<Player>;

  readonly artifactManager: ArtifactManagerComponent;

  readonly cardTracker: CardTrackerComponent;

  private readonly _unlockedRunes: RuneCost = {};

  private _resourceActionsPerformedThisTurn: PlayerResourceAction[] = [];

  _hasPassedThisRound = false;

  hasPlayedDestinyCardThisTurn = false;

  private _hero!: {
    card: HeroCard;
    lineage: HeroCard[];
  };

  constructor(
    game: Game,
    private options: PlayerOptions
  ) {
    super(options.id, makeInterceptors());
    this.game = game;
    this.cardTracker = new CardTrackerComponent(game, this);
    this.boardSide = new BoardSide(this.game, this);
    this.cardManager = new CardManagerComponent(game, this, {
      maxHandSize: this.game.config.MAX_HAND_SIZE,
      shouldShuffleDeck: true
    });
    this.modifiers = new ModifierManager<Player>(this);
    this.artifactManager = new ArtifactManagerComponent(game, this);
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
    await this._hero.card.play(() => {});
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

  serialize() {
    return {
      id: this.id,
      entityType: 'player' as const,
      name: this.options.name,
      hand: this.cardManager.hand.map(card => card.id),
      handSize: this.cardManager.hand.length,
      discardPile: [...this.cardManager.discardPile].map(card => card.id),
      banishPile: [...this.cardManager.banishPile].map(card => card.id),
      destinyZone: [...this.cardManager.destinyZone].map(card => card.id),
      remainingCardsInMainDeck: this.cardManager.mainDeck.cards.length,
      remainingCardsInDestinyDeck: this.cardManager.destinyDeck.cards.length,
      maxHp: this.hero.maxHp,
      currentHp: this.hero.remainingHp,
      isPlayer1: this.isPlayer1,
      influence: this.influence,
      unlockedRunes: { ...this._unlockedRunes },
      canPerformResourceAction:
        this._resourceActionsPerformedThisTurn.length < this.maxResourceActionPerTurn,
      remainingResourceActions: {
        draw_card:
          this.getMaxResourceActionsPerType('draw_card') -
          this._resourceActionsPerformedThisTurn.filter(a => a.type === 'draw_card')
            .length,
        gain_rune:
          this.getMaxResourceActionsPerType('gain_rune') -
          this._resourceActionsPerformedThisTurn.filter(a => a.type === 'gain_rune')
            .length
      },
      remainingTotalResourceActions:
        this.maxResourceActionPerTurn - this._resourceActionsPerformedThisTurn.length,
      maxResourceActionPerTurn: this.maxResourceActionPerTurn
    };
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

  get minions() {
    return this.boardSide.getAllMinions();
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

  get hasPassedThisRound() {
    return this._hasPassedThisRound;
  }

  passTurn() {
    this._hasPassedThisRound = true;
  }

  get unlockedRunes() {
    return { ...this._unlockedRunes };
  }

  async gainRune(rune: RuneCost) {
    await this.game.emit(
      GAME_EVENTS.BEFORE_GAIN_RUNE,
      new PlayerGainRuneEvent({ player: this, rune })
    );
    for (const [key, value] of Object.entries(rune)) {
      const k = key as keyof RuneCost;
      if (!this._unlockedRunes[k]) {
        this._unlockedRunes[k] = 0;
      }
      this._unlockedRunes[k]! += value!;
    }
    await this.game.emit(
      GAME_EVENTS.AFTER_GAIN_RUNE,
      new PlayerGainRuneEvent({ player: this, rune })
    );
  }

  async spendRune(rune: RuneCost) {
    await this.game.emit(
      GAME_EVENTS.BEFORE_SPEND_RUNE,
      new PlayerSpendRuneEvent({ player: this, rune })
    );
    for (const [key, value] of Object.entries(rune)) {
      const k = key as keyof RuneCost;
      const currentAmount = this._unlockedRunes[k] ?? 0;
      this._unlockedRunes[k]! = Math.max(0, currentAmount - (value ?? 0));
    }
    await this.game.emit(
      GAME_EVENTS.AFTER_SPEND_RUNE,
      new PlayerSpendRuneEvent({ player: this, rune })
    );
  }

  hasRunes(runes: RuneCost) {
    for (const [key, value] of Object.entries(runes)) {
      const k = key as keyof RuneCost;
      const currentAmount = this._unlockedRunes[k] ?? 0;
      if (currentAmount < (value ?? 0)) {
        return false;
      }
    }
    return true;
  }

  get maxResourceActionPerTurn() {
    return this.interceptors.maxResourceActionPerTurn.getValue(
      this.game.config.MAX_RESOURCE_ACTIONS_PER_TURN,
      {}
    );
  }

  getMaxResourceActionsPerType(actionType: PlayerResourceAction['type']): number {
    const defaultLimits: Record<PlayerResourceAction['type'], number> = {
      draw_card: this.game.config.MAX_RESOURCE_ACTIONS_PER_TURN,
      gain_rune: this.game.config.MAX_RESOURCE_ACTIONS_PER_TURN
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

  async performResourceAction(action: PlayerResourceAction) {
    // Check if the action type has reached its maximum limit for this turn
    const maxForType = this.getMaxResourceActionsPerType(action.type);
    const performedCountForType = this._resourceActionsPerformedThisTurn.filter(
      a => a.type === action.type
    ).length;

    if (performedCountForType >= maxForType) {
      throw new GameError(
        `Cannot perform '${action.type}' more than ${maxForType} time(s) per turn`
      );
    }

    if (this._resourceActionsPerformedThisTurn.length >= this.maxResourceActionPerTurn) {
      throw new GameError(
        `Cannot perform more than ${this.maxResourceActionPerTurn} resource actions per turn`
      );
    }

    await match(action)
      .with({ type: 'gain_rune' }, async ({ rune }) => {
        await this.gainRune({ [rune]: 1 });
      })
      .with({ type: 'draw_card' }, async () => {
        await this.cardManager.draw(1);
      })
      .exhaustive();

    this._resourceActionsPerformedThisTurn.push(action);
  }

  private async playCard(card: AnyCard) {
    const isAction = !isDefined(this.game.effectChainSystem.currentChain);
    await card.play(async () => {
      if (isAction) {
        await this.game.turnSystem.switchInitiative();
      }
    });
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

  async payForLoyaltyCost(card: AnyCard) {
    if (card.faction.id === this.hero.faction.id) return;

    const loyaltyHpCost = card.loyaltyHpCost;
    if (loyaltyHpCost > 0) {
      await this.hero.takeDamage(card, new UnpreventableDamage(loyaltyHpCost));
    }

    for (let i = 1; i <= card.loyaltyRuneConsumption; i++) {
      await this.game.interaction.askQuestion({
        source: card,
        player: this,
        questionId: 'PLAY_CARD_LOYALTY_COST',
        label: `Loyalty cost: Choose a rune to consume (${i} / ${card.loyaltyRuneConsumption})`,
        minChoiceCount: 1,
        maxChoiceCount: 1,
        choices: Object.values(RUNES).map(rune => ({
          id: rune,
          label: uppercaseFirstLetter(rune.toLocaleLowerCase())
        }))
      });
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
    card.isPlayedFromHand = true;
    await this.playCard(card);
  }

  private async payForDestinyCost(cost: number) {
    const pool = [...this.cardManager.destinyZone];
    const hasEnough = pool.length >= cost;
    assert(hasEnough, new NotEnoughCardsInDestinyZoneError());

    const banishedCards: Array<{ card: AnyCard; index: number }> = [];
    for (let i = 0; i < cost; i++) {
      const index = this.game.rngSystem.nextInt(pool.length - 1);
      const card = pool[index];
      await card.sendToBanishPile();
      banishedCards.push({ card, index });
      pool.splice(index, 1);
    }

    await this.game.emit(
      GAME_EVENTS.PLAYER_PAY_FOR_DESTINY_COST,
      new PlayerPayForDestinyCostEvent({
        player: this,
        cards: banishedCards
      })
    );
  }

  async startTurn() {
    await this.game.emit(
      GAME_EVENTS.PLAYER_START_TURN,
      new PlayerTurnEvent({ player: this })
    );
    this.hasPlayedDestinyCardThisTurn = false;
    this._resourceActionsPerformedThisTurn = [];
    this._hasPassedThisRound = false;
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
}
