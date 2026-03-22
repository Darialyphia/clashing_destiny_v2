import { BoardSide } from '../board/board-side.entity';
import { CardManagerComponent } from '../card/components/card-manager.component';
import { type Game } from '../game/game';
import { assert, type MaybePromise, type Serializable } from '@game/shared';
import type { AnyCard } from '../card/entities/card.entity';
import {
  NotEnoughCardsInDestinyZoneError,
  NotEnoughCardsInHandError,
  NotEnoughManaError
} from '../card/card-errors';
import { type HeroCard } from '../card/entities/hero.entity';
import { CardTrackerComponent } from './components/cards-tracker.component';
import { Interceptable } from '../utils/interceptable';
import { GAME_EVENTS } from '../game/game.events';
import { PlayerManaChangeEvent, PlayerTurnEvent } from './player.events';
import type { Ability, AbilityOwner } from '../card/entities/ability.entity';
import { HERO_EVENTS, HeroLevelUpEvent } from '../card/events/hero.events';
import { EntityWithModifiers } from '../modifier/entity-with-modifiers';
import { LockedModifier } from '../modifier/modifiers/locked.modifier';
import { cloneDeep } from 'lodash-es';
import { RuneManagerComponent } from './components/rune-manager.component';
import type { RuneCard } from '../card/entities/rune.entity';

export type PlayerOptions = {
  id: string;
  name: string;
  hero: string;
  mainDeck: { cards: string[] };
  runeDeck: { cards: string[] };
};

export type SerializedPlayer = {
  id: string;
  entityType: 'player';
  name: string;
  hand: Array<{ cardId: string; isLocked: boolean; isRevealed: boolean }>;
  handSize: number;
  discardPile: string[];
  banishPile: string[];
  runeZone: string[];
  remainingCardsInMainDeck: number;
  remainingCardsInRuneDeck: number;
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

  readonly runeManager: RuneManagerComponent;

  private _resourceActionsPerformedThisTurn: PlayerResourceAction[] = [];

  private _hasReceivedInitiativeThisTurn = false;

  private _mana = 0;

  private _baseMaxMana = 0;

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
    this.runeManager = new RuneManagerComponent(game, this);
    this.boardSide = new BoardSide(this.game, this);
    this.cardManager = new CardManagerComponent(game, this, {
      maxHandSize: this.game.config.MAX_HAND_SIZE,
      shouldShuffleDeck: true
    });
  }

  async init() {
    await this.setupHero();
    await this.cardManager.init(this.options.mainDeck.cards, this.options.runeDeck.cards);
    this.game.on(GAME_EVENTS.TURN_INITATIVE_CHANGE, async event => {
      if (!event.data.newInitiativePlayer.equals(this)) return;
      await this.playRuneForTurn();
    });
  }

  private async playRuneForTurn() {
    if (this._hasReceivedInitiativeThisTurn) return;
    this._hasReceivedInitiativeThisTurn = true;

    const topRunes = this.cardManager.runeDeck.cards.slice(0, 2);
    if (topRunes.length === 0) return;

    const [runeToPlay] = await this.game.interaction.chooseCards<RuneCard>({
      player: this,
      timeoutFallback: [topRunes[0]],
      label: 'Choose a Rune to put in the Rune Zone',
      minChoiceCount: 1,
      maxChoiceCount: 1,
      choices: topRunes.map(card => ({
        card,
        aiHints: {
          shouldPick: () => 1
        }
      }))
    });
    await runeToPlay.play();

    for (const rune of topRunes) {
      if (rune.equals(runeToPlay)) continue;
      this.cardManager.runeDeck.pluckById(rune.id);
      this.cardManager.runeDeck.addCardAtRandomPosition(rune);
    }
    this.cardManager.runeDeck.shuffle();
  }
  private async setupHero() {
    this._hero = {
      card: await this.generateCard<HeroCard>(this.options.hero),
      lineage: []
    };
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
    return this.cardManager.hand.length + this.cardManager.runeZone.size;
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

  private async payForManaCost(manaCost: number) {
    assert(this.canSpendMana(manaCost), new NotEnoughManaError());
    await this.spendMana(manaCost);
  }

  async playMainDeckCard(card: AnyCard) {
    await this.payForManaCost(card.manaCost);
    card.isPlayedFromHand = true;
    await this.playCard(card);
  }

  async useAbility(ability: Ability<AbilityOwner>, onResolved: () => MaybePromise<void>) {
    await this.payForManaCost(ability.manaCost);
    await ability.use(onResolved);
  }

  async startTurn() {
    await this.game.emit(
      GAME_EVENTS.PLAYER_START_TURN,
      new PlayerTurnEvent({ player: this })
    );
    this._resourceActionsPerformedThisTurn = [];
    this._hasReceivedInitiativeThisTurn = false;
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
      runeZone: [...this.cardManager.runeZone].map(card => card.id),
      remainingCardsInMainDeck: this.cardManager.mainDeck.cards.length,
      remainingCardsInRuneDeck: this.cardManager.runeDeck.cards.length,
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
