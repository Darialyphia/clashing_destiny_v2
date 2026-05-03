import { BoardSide, type SerializedBoardSide } from '../board/board-side.entity';
import { CardManagerComponent } from '../card/components/card-manager.component';
import { type Game } from '../game/game';
import { assert, isDefined, type MaybePromise, type Serializable } from '@game/shared';
import type { AnyCard } from '../card/entities/card.entity';
import { NotEnoughManaError } from '../card/card-errors';
import { CardTrackerComponent } from './components/cards-tracker.component';
import { Interceptable } from '../utils/interceptable';
import { GAME_EVENTS } from '../game/game.events';
import { PlayerTurnEvent } from './player.events';
import type { Ability, AbilityOwner } from '../card/entities/ability.entity';
import { EntityWithModifiers } from '../modifier/entity-with-modifiers';
import { LockedModifier } from '../modifier/modifiers/locked.modifier';
import { cloneDeep } from 'lodash-es';
import { LevelManagerComponent } from './components/level-manager.component';
import { ManaManagerComponent } from './components/mana-manager.component';
import { isArtifact, isMinion } from '../card/card-utils';

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
  remainingCardsInDestinyDeck: number;
  destinyDeck: string[];
  maxHp: number;
  currentHp: number;
  isPlayer1: boolean;
  maxMana: number;
  currentMana: number;
  manaRegen: number;
  exp: number;
  level: number;
  maxLevel: number;
  hero: string;
  destinies: string[];
  boardSide: SerializedBoardSide;
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

export type PlayerResourceAction = { type: 'rune' } | { type: 'draw' };

export class Player
  extends EntityWithModifiers<PlayerInterceptors>
  implements Serializable<SerializedPlayer>
{
  readonly boardSide: BoardSide;

  readonly cardManager: CardManagerComponent;

  readonly cardTracker: CardTrackerComponent;

  readonly levelManager: LevelManagerComponent;

  readonly manaManager = new ManaManagerComponent(this.game, this, {
    manaRegen: this.interceptors.manaRegen,
    maxMana: this.interceptors.maxMana
  });

  private options: PlayerOptions;

  constructor(game: Game, options: PlayerOptions) {
    super(options.id, game, makeInterceptors());
    this.options = cloneDeep(options);
    this.game = game;
    this.cardTracker = new CardTrackerComponent(game, this);
    this.boardSide = new BoardSide(this.game, this);
    this.cardManager = new CardManagerComponent(game, this, {
      maxHandSize: this.game.config.MAX_HAND_SIZE,
      shouldShuffleDeck: true,
      deck: options.deck.cards
    });
    this.levelManager = new LevelManagerComponent(game, this);
  }

  async init() {
    await this.cardManager.init();
    this.manaManager.init();
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
    return this.cardManager.hero;
  }

  get enemyHero() {
    return this.opponent.hero;
  }

  get minionsInBase() {
    return this.boardSide.base
      .map(space => space.card)
      .filter(isDefined)
      .filter(isMinion);
  }

  get minionsInBattlefield() {
    return this.boardSide.battlefield
      .map(space => space.card)
      .filter(isDefined)
      .filter(isMinion);
  }

  get artifactsInBase() {
    return this.boardSide.base
      .map(space => space.card)
      .filter(isDefined)
      .filter(isArtifact);
  }

  get artifactsInBattlefield() {
    return this.boardSide.battlefield
      .map(space => space.card)
      .filter(isDefined)
      .filter(isArtifact);
  }

  get minions() {
    return [...this.minionsInBase];
  }

  get artifacts() {
    return [...this.artifactsInBase, ...this.artifactsInBattlefield];
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

  get enemyArtifacts() {
    return this.opponent.artifacts;
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

  async startTurn() {
    await this.game.emit(
      GAME_EVENTS.PLAYER_START_TURN,
      new PlayerTurnEvent({ player: this })
    );
    for (const card of this.boardSide.getAllCardsInPlay()) {
      if (card.shouldWakeUpAtTurnStart) {
        await card.wakeUp();
      }
    }
    await this.levelManager.gainExp(this.game.config.EXP_GAIN_PER_TURN);
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
        isLocked: card.modifiers.has(LockedModifier),
        isRevealed: card.isRevealed
      })),
      handSize: this.cardManager.hand.length,
      discardPile: [...this.cardManager.discardPile].map(card => card.id),
      banishPile: [...this.cardManager.banishPile].map(card => card.id),
      remainingCardsInMainDeck: this.cardManager.mainDeck.cards.length,
      remainingCardsInDestinyDeck: this.cardManager.destinyDeck.cards.length,
      destinyDeck: [...this.cardManager.destinyDeck.cards].map(card => card.id),
      maxHp: this.hero.maxHp,
      currentHp: this.hero.remainingHp,
      isPlayer1: this.isPlayer1,
      currentMana: this.mana,
      maxMana: this.maxMana,
      manaRegen: this.manaRegen,
      exp: this.levelManager.exp,
      level: this.levelManager.level,
      maxLevel: this.game.config.PLAYER_MAX_LEVEL,
      hero: this.hero.id,
      destinies: this.levelManager.destinies.map(destiny => destiny.id),
      boardSide: this.boardSide.serialize()
    };
  }
}
