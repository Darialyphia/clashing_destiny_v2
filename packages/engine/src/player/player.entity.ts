import { CardManagerComponent } from '../card/components/card-manager.component';
import { type Game } from '../game/game';
import { assert, isDefined, type MaybePromise, type Serializable } from '@game/shared';
import type { AnyCard } from '../card/entities/card.entity';
import { NotEnoughManaError } from '../card/card-errors';
import { CardTrackerComponent } from './components/cards-tracker.component';
import { Interceptable } from '../utils/interceptable';
import type { Ability, AbilityOwner } from '../card/entities/ability.entity';
import { EntityWithModifiers } from '../modifier/entity-with-modifiers';
import { cloneDeep } from 'lodash-es';
import { ManaManagerComponent } from './components/mana-manager.component';
import { isMinion } from '../card/card-utils';
import { match } from 'ts-pattern';
import { BoardSide, type SerializedBoardSide } from '../board/board-side.entity';
import { GAME_EVENTS } from '../game/game.events';
import { PlayerGainVictoryPointEvent } from './player.events';

export type PlayerOptions = {
  id: string;
  name: string;
  deck: { cards: { blueprintId: string; isFoil: boolean }[] };
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
  isPlayer1: boolean;
  maxMana: number;
  currentMana: number;
  manaRegen: number;
  boardSide: SerializedBoardSide;
  victoryPoints: number;
};

export type PlayerInterceptors = {
  cardsDrawnForTurn: Interceptable<number>;
  manaRegen: Interceptable<number>;
  maxMana: Interceptable<number>;
};

const makeInterceptors = (): PlayerInterceptors => {
  return {
    cardsDrawnForTurn: new Interceptable(),
    manaRegen: new Interceptable(),
    maxMana: new Interceptable()
  };
};

export class Player
  extends EntityWithModifiers<PlayerInterceptors>
  implements Serializable<SerializedPlayer>
{
  readonly cardManager: CardManagerComponent;

  readonly cardTracker: CardTrackerComponent;

  readonly manaManager = new ManaManagerComponent(this.game, this, {
    maxMana: this.interceptors.maxMana
  });

  readonly boardSide: BoardSide;

  private options: PlayerOptions;

  private _victoryPoints = 0;

  hasPassedThisTurn = false;

  constructor(game: Game, options: PlayerOptions) {
    super(options.id, game, makeInterceptors());
    this.options = cloneDeep(options);
    this.game = game;
    this.boardSide = new BoardSide(this.game, this);

    this.cardTracker = new CardTrackerComponent(game, this);
    this.cardManager = new CardManagerComponent(game, this, {
      maxHandSize: this.game.config.MAX_HAND_SIZE,
      shouldShuffleDeck: true,
      deck: options.deck.cards
    });
  }

  async init() {
    await this.cardManager.init();
    this.manaManager.init();
  }

  get victoryPoints() {
    return this._victoryPoints;
  }

  async gainVictoryPoints(amount: number) {
    await this.game.emit(
      GAME_EVENTS.PLAYER_BEFORE_GAIN_VICTORY_POINT,
      new PlayerGainVictoryPointEvent({ player: this, amount })
    );
    this._victoryPoints += amount;
    await this.game.emit(
      GAME_EVENTS.PLAYER_AFTER_GAIN_VICTORY_POINT,
      new PlayerGainVictoryPointEvent({ player: this, amount })
    );
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

    const base = match(this.game.config.CARD_DRAW_MODE)
      .with('fixed', () => this.game.config.CARDS_DRAWN_PER_TURN)
      .with('threshold', () =>
        Math.max(0, this.game.config.CARDS_DRAWN_PER_TURN - this.cardManager.hand.length)
      )
      .exhaustive();

    return this.interceptors.cardsDrawnForTurn.getValue(base, {});
  }

  get isPlayer1() {
    return this.game.playerSystem.player1.equals(this);
  }

  get opponent() {
    return this.game.playerSystem.players.find(p => !p.equals(this))!;
  }

  get minionsInBase() {
    return this.boardSide.base
      .map(space => space.card)
      .filter(isDefined)
      .filter(isMinion);
  }

  get minionsInLeftBattlefield() {
    return this.boardSide.leftBattlefield.spaces
      .map(space => space.card)
      .filter(isDefined)
      .filter(isMinion);
  }

  get minionsInRightBattlefield() {
    return this.boardSide.rightBattlefield.spaces
      .map(space => space.card)
      .filter(isDefined)
      .filter(isMinion);
  }

  get minionsInBattlefield() {
    return [...this.minionsInLeftBattlefield, ...this.minionsInRightBattlefield];
  }

  get minions() {
    return [...this.minionsInBase, ...this.minionsInBattlefield];
  }

  get allCardsInPlay() {
    return [...this.minionsInBase, ...this.minionsInBattlefield].filter(isDefined);
  }

  get enemyMinions() {
    return this.opponent.minions;
  }

  get isInteractive() {
    return this.game.interaction.isInteractive(this);
  }

  private async payForManaCost(manaCost: number) {
    assert(this.canSpendMana(manaCost), new NotEnoughManaError());
    await this.spendMana(manaCost);
  }

  async useAbility(ability: Ability<AbilityOwner>, onResolved: () => MaybePromise<void>) {
    await this.payForManaCost(ability.manaCost);
    await ability.use(onResolved);
  }

  get hasInitiative() {
    return this.game.turnSystem.initiativePlayer.equals(this);
  }

  passTurn() {
    this.hasPassedThisTurn = true;
  }

  async startTurn() {
    this.hasPassedThisTurn = false;

    for (const card of this.allCardsInPlay) {
      if (card.shouldWakeUpAtTurnStart) {
        await card.wakeUp();
      }
    }
  }

  generateCard<T extends AnyCard>(blueprintId: string, isFoil: boolean) {
    const card = this.game.cardSystem.addCard<T>(this, blueprintId, isFoil);

    return card;
  }

  get mana() {
    return this.manaManager.mana;
  }

  get maxMana() {
    return this.manaManager.maxMana;
  }

  get manaRegen() {
    return this.manaManager.manaRegen;
  }

  async spendMana(amount: number) {
    await this.manaManager.spend(amount);
  }

  async gainMana(amount: number) {
    await this.manaManager.gain(amount);
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
        isLocked: false,
        isRevealed: card.isRevealed
      })),
      handSize: this.cardManager.hand.length,
      discardPile: [...this.cardManager.discardPile].map(card => card.id),
      banishPile: [...this.cardManager.banishPile].map(card => card.id),
      remainingCardsInMainDeck: this.cardManager.mainDeck.cards.length,
      isPlayer1: this.isPlayer1,
      currentMana: this.mana,
      maxMana: this.maxMana,
      manaRegen: this.manaRegen,
      boardSide: this.boardSide.serialize(),
      victoryPoints: this.victoryPoints
    };
  }
}
