import { BoardSide } from '../board/board-side.entity';
import { CardManagerComponent } from '../card/components/card-manager.component';
import { Entity } from '../entity';
import { type Game } from '../game/game';
import { assert, isDefined, type MaybePromise, type Serializable } from '@game/shared';
import { ArtifactManagerComponent } from './components/artifact-manager.component';
import type { AnyCard } from '../card/entities/card.entity';
import {
  NotEnoughCardsInDestinyZoneError,
  NotEnoughCardsInHandError
} from '../card/card-errors';
import {
  HERO_EVENTS,
  HeroLevelUpEvent,
  type HeroCard
} from '../card/entities/hero.entity';
import { CardTrackerComponent } from './components/cards-tracker.component';
import { Interceptable } from '../utils/interceptable';
import { GAME_EVENTS } from '../game/game.events';
import { PlayerPayForDestinyCostEvent, PlayerTurnEvent } from './player.events';
import { ModifierManager } from '../modifier/modifier-manager.component';
import type { Ability, AbilityOwner } from '../card/entities/ability.entity';
import { GameError } from '../game/game-error';

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
  remainingCardsInDeck: number;
  maxHp: number;
  currentHp: number;
  isPlayer1: boolean;
};

type PlayerInterceptors = {
  cardsDrawnForTurn: Interceptable<number>;
};
const makeInterceptors = (): PlayerInterceptors => {
  return {
    cardsDrawnForTurn: new Interceptable<number>()
  };
};

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
      mainDeck: this.options.mainDeck.cards,
      destinyDeck: this.options.destinyDeck.cards,
      maxHandSize: this.game.config.MAX_HAND_SIZE,
      shouldShuffleDeck: true
    });
    this.modifiers = new ModifierManager<Player>(this);
    this.artifactManager = new ArtifactManagerComponent(game, this);
  }

  async init() {
    this._hero = {
      card: await this.generateCard<HeroCard>(this.game.config.INITIAL_HERO_BLUEPRINTID),
      lineage: []
    };
    await this._hero.card.play(() => {});
    await this.cardManager.init();
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
    await this.game.emit(
      HERO_EVENTS.HERO_AFTER_LEVEL_UP,
      new HeroLevelUpEvent({ from: oldHero, to: newHero })
    );
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
      remainingCardsInDeck: this.cardManager.mainDeck.cards.length,
      maxHp: this.hero.maxHp,
      currentHp: this.hero.remainingHp,
      isPlayer1: this.isPlayer1,
      influence: this.influence
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
    return this._hero.card;
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

  private payForManaCost(manaCost: number, indices: number[]) {
    const hasEnough = this.cardManager.hand.length >= manaCost;
    assert(hasEnough, new NotEnoughCardsInHandError());
    const cards = this.cardManager.hand.filter((_, i) => indices.includes(i));
    cards.forEach(card => {
      if (!card.canBeUsedAsManaCost) {
        throw new GameError(`Cannot use card '${card.id}' as mana cost`);
      }
      card.sendToDestinyZone();
    });
  }

  async playMainDeckCard(card: AnyCard, manaCostIndices: number[]) {
    this.payForManaCost(card.manaCost, manaCostIndices);
    const isAction = !isDefined(this.game.effectChainSystem.currentChain);
    await card.play(() => {
      if (isAction) {
        this.game.turnSystem.switchInitiative();
      }
    });
  }

  async useAbility(
    ability: Ability<AbilityOwner>,
    manaCostIndices: number[],
    onResolved: () => MaybePromise<void>
  ) {
    this.payForManaCost(ability.manaCost, manaCostIndices);
    await ability.use(onResolved);
  }

  async playDestinyDeckCard(card: AnyCard) {
    await this.payForDestinyCost(card.destinyCost);
    const isAction = !isDefined(this.game.effectChainSystem.currentChain);
    await card.play(() => {
      if (isAction) {
        this.game.turnSystem.switchInitiative();
      }
    });
  }

  private async payForDestinyCost(cost: number) {
    const prioritizedCards = Array.from(this.cardManager.discardPile).filter(
      card => card.canBeUsedAsDestinyCost
    );
    const pool = [...this.cardManager.destinyZone, ...prioritizedCards];
    const hasEnough = pool.length >= cost;
    assert(hasEnough, new NotEnoughCardsInDestinyZoneError());

    const banishedCards: Array<{ card: AnyCard; index: number }> = [];
    for (let i = 0; i < cost; i++) {
      if (prioritizedCards.length > 0) {
        const card = prioritizedCards.shift()!;
        card.sendToBanishPile();
        banishedCards.push({ card, index: -1 });
      } else {
        const index = this.game.rngSystem.nextInt(this.cardManager.destinyZone.size - 1);
        const card = [...this.cardManager.destinyZone][index];
        card.sendToBanishPile();
        banishedCards.push({ card, index });
      }
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
    for (const card of this.boardSide.getAllCardsInPlay()) {
      await card.wakeUp();
    }
  }

  async endTurn() {
    await this.game.emit(
      GAME_EVENTS.PLAYER_END_TURN,
      new PlayerTurnEvent({ player: this })
    );
  }

  generateCard<T extends AnyCard>(blueprintId: string) {
    const card = this.game.cardSystem.addCard<T>(this, blueprintId);

    return card;
  }
}
