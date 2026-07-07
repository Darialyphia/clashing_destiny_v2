import { BoardSide } from '../board/board-side.entity';
import { CardManagerComponent } from '../card/components/card-manager.component';
import { type Game } from '../game/game';
import {
  assert,
  type MaybePromise,
  type Nullable,
  type Serializable
} from '@game/shared';
import type { AnyCard } from '../card/entities/card.entity';
import { NotEnoughManaError } from '../card/card-errors';
import { type HeroCard } from '../card/entities/hero.entity';
import { CardTrackerComponent } from './components/cards-tracker.component';
import { Interceptable } from '../utils/interceptable';
import { GAME_EVENTS } from '../game/game.events';
import { PlayerManaChangeEvent, PlayerTurnEvent } from './player.events';
import type { Ability, AbilityOwner } from '../card/entities/ability.entity';
import { EntityWithModifiers } from '../modifier/entity-with-modifiers';
import { LockedModifier } from '../modifier/modifiers/locked.modifier';
import { cloneDeep } from 'lodash-es';
import { match } from 'ts-pattern';
import { IllegalResourceActionError } from '../input/input-errors';
import { ArtifactManagerComponent } from './components/artifact-manager.component';
import { GAME_PHASES } from '../game/game.enums';
import type { MainPhase } from '../game/phases/main.phase';
import { LevelManagerComponent } from './components/level-manager.component';
import type { DestinyCard } from '../card/entities/destiny.entity';
import { CARD_EVENTS } from '../card/card.enums';

export type PlayerOptions = {
  id: string;
  name: string;
  hero: string;
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
  remainingCardsInMainDeck: number;
  canPerformResourceAction: boolean;
  maxResourceActionPerTurn: number;
  remainingTotalResourceActions: number;
  maxHp: number;
  currentHp: number;
  isPlayer1: boolean;
  maxMana: number;
  currentMana: number;
  manaRegen: number;
  exp: number;
  level: number;
  talents: string[];
  currentlyPlayedCard: string | null;
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

export type PlayerResourceAction = { type: 'draw' };

export class Player
  extends EntityWithModifiers<PlayerInterceptors>
  implements Serializable<SerializedPlayer>
{
  readonly boardSide: BoardSide;

  readonly cardManager: CardManagerComponent;

  readonly cardTracker: CardTrackerComponent;

  private _resourceActionsPerformedThisTurn: PlayerResourceAction[] = [];

  private _hasPassedThisTurn = false;

  private _mana = 0;

  private _baseMaxMana = 0;

  currentlyPlayedCard: Nullable<AnyCard> = null;

  currentlyPlayedCardIndexInHand: Nullable<number> = null;

  private _hero!: {
    card: HeroCard;
    lineage: HeroCard[];
  };

  private options: PlayerOptions;

  readonly artifactManager: ArtifactManagerComponent;

  readonly levelManager: LevelManagerComponent;

  constructor(game: Game, options: PlayerOptions) {
    super(options.id, game, makeInterceptors());
    this.options = cloneDeep(options);
    this.game = game;
    this.cardTracker = new CardTrackerComponent(game, this);
    this.artifactManager = new ArtifactManagerComponent(game, this);
    this.levelManager = new LevelManagerComponent(game, this);
    this.boardSide = new BoardSide(this.game, this);
    this.cardManager = new CardManagerComponent(game, this, {
      maxHandSize: this.game.config.MAX_HAND_SIZE,
      shouldShuffleDeck: true
    });
  }

  async init() {
    await this.setupHero();
    await this.cardManager.init(
      this.options.mainDeck.cards,
      this.options.destinyDeck.cards
    );
  }

  private async setupHero() {
    this._hero = {
      card: await this.generateCard<HeroCard>(this.options.hero),
      lineage: []
    };
    await this._hero.card.play();
    await this._hero.card.removeFromCurrentLocation();
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

  get heroLineage() {
    return this._hero.lineage;
  }

  get level() {
    return this.levelManager.level;
  }

  get enemyHero() {
    return this.opponent.hero;
  }

  get minions() {
    return this.boardSide.getAllMinions();
  }

  get allies() {
    return [this.hero, ...this.minions];
  }

  get enemies() {
    return [this.enemyHero, ...this.enemyMinions];
  }

  get enemyMinions() {
    return this.opponent.minions;
  }

  get isInteractive() {
    return this.game.interaction.isInteractive(this);
  }

  get maxResourceActionPerTurn() {
    return this.interceptors.maxResourceActionPerTurn.getValue(
      this.game.config.MAX_RESOURCE_ACTIONS_PER_TURN,
      {}
    );
  }

  getMaxResourceActionsPerType(actionType: PlayerResourceAction['type']): number {
    const defaultLimits: Record<PlayerResourceAction['type'], number> = {
      draw: this.game.config.MAX_RESOURCE_ACTIONS_PER_TURN
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
    if (!this.canPerformResourceActionOfType(action.type)) {
      throw new IllegalResourceActionError();
    }

    this._resourceActionsPerformedThisTurn.push(action);

    return match(action)
      .with({ type: 'draw' }, async () => {
        await this.cardManager.draw(1);
      })
      .exhaustive();
  }

  async playMainDeckCard(card: AnyCard) {
    card.isPlayedFromHand = true;

    // eslint-disable-next-line no-async-promise-executor
    return new Promise<{ cancelled: boolean }>(async resolve => {
      this.currentlyPlayedCard = card;
      this.currentlyPlayedCardIndexInHand = this.cardManager.hand.indexOf(card);
      const stop = this.game.on(CARD_EVENTS.CARD_BEFORE_PLAY, async e => {
        if (e.data.card.equals(card)) {
          await this.spendMana(card.manaCost);
          stop();
        }
      });
      await card.play(async () => {
        this.currentlyPlayedCard = null;
        this.currentlyPlayedCardIndexInHand = null;
        resolve({ cancelled: true });
      });

      stop();
      this.currentlyPlayedCard = null;
      this.currentlyPlayedCardIndexInHand = null;
      resolve({ cancelled: false });
    });
  }

  async playDestinyDeckCard(card: DestinyCard) {
    await this.levelManager.levelUp(card as DestinyCard);
  }

  async useAbility(ability: Ability<AbilityOwner>, onResolved: () => MaybePromise<void>) {
    await this.spendMana(ability.manaCost);
    await ability.use(onResolved);
  }

  async startTurn() {
    await this.game.emit(
      GAME_EVENTS.PLAYER_START_TURN,
      new PlayerTurnEvent({ player: this })
    );
    this._resourceActionsPerformedThisTurn = [];
    this._hasPassedThisTurn = false;

    this.refillMana();

    for (const card of this.boardSide.getAllCardsInPlay()) {
      if (card.shouldWakeUpAtTurnStart) {
        await card.wakeUp();
      }
    }

    await this.levelManager.gainExp(this.game.config.EXP_GAIN_PER_TURN);
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
    this._mana = Math.min(this._mana + amount, this.maxMana);
    await this.game.emit(
      GAME_EVENTS.PLAYER_AFTER_MANA_CHANGE,
      new PlayerManaChangeEvent({ player: this, amount })
    );
  }

  canSpendMana(amount: number) {
    return this.mana >= amount;
  }

  get hasPassedThisTurn() {
    return this._hasPassedThisTurn;
  }

  get canPass() {
    const phaseCtx = this.game.gamePhaseSystem.getContext();
    return phaseCtx.state === GAME_PHASES.MAIN && !this._hasPassedThisTurn;
  }

  async pass() {
    this._hasPassedThisTurn = true;
    const phaseCtx = this.game.gamePhaseSystem.getContext().ctx as MainPhase;
    await phaseCtx.pass(this);
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
      remainingCardsInMainDeck: this.cardManager.mainDeck.cards.length,
      maxHp: this.hero.maxHp,
      currentHp: this.hero.remainingHp,
      isPlayer1: this.isPlayer1,
      canPerformResourceAction:
        this.mana >= this.game.config.RESOURCE_ACTION_COST &&
        this._resourceActionsPerformedThisTurn.length < this.maxResourceActionPerTurn,
      remainingTotalResourceActions:
        this.maxResourceActionPerTurn - this._resourceActionsPerformedThisTurn.length,
      maxResourceActionPerTurn: this.maxResourceActionPerTurn,
      currentMana: this._mana,
      maxMana: this.maxMana,
      manaRegen: this.manaRegen,
      exp: this.levelManager.exp,
      level: this.levelManager.level,
      talents: this.levelManager.talents.map(t => t.id),
      currentlyPlayedCard: this.currentlyPlayedCard?.id ?? null
    };
  }
}
