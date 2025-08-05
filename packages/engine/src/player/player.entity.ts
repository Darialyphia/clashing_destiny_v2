import { BoardSide } from '../board/board-side.entity';
import { CardManagerComponent } from '../card/components/card-manager.component';
import { Entity } from '../entity';
import { type Game } from '../game/game';
import { assert, isDefined, type Serializable } from '@game/shared';
import { ArtifactManagerComponent } from './components/artifact-manager.component';
import type { AnyCard } from '../card/entities/card.entity';
import {
  CardNotFoundError,
  NotEnoughCardsInDestinyZoneError,
  NotEnoughCardsInHandError
} from '../card/card-errors';
import type { HeroCard } from '../card/entities/hero.entity';
import { AFFINITIES, type Affinity } from '../card/card.enums';
import { CardTrackerComponent } from './components/cards-tracker.component';
import { Interceptable } from '../utils/interceptable';
import { GAME_EVENTS } from '../game/game.events';
import {
  PlayerPayForDestinyCostEvent,
  PlayerTurnEvent,
  PlayerUnlockAffinityEvent
} from './player.events';
import type { MainDeckCard } from '../board/board.system';
import { ModifierManager } from '../modifier/modifier-manager.component';
import { type SerializedTalentTree } from '../card/talent-tree';
import type { DestinyCard } from '../card/entities/destiny.entity';
import type { SpellCard } from '../card/entities/spell.entity';
import type { ArtifactCard } from '../card/entities/artifact.entity';
import type { MinionCard } from '../card/entities/minion.entity';

export type PlayerOptions = {
  id: string;
  name: string;
  mainDeck: { cards: string[] };
  destinyDeck: { cards: string[] };
  hero: string;
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
  unlockedAffinities: Affinity[];
  unlockedDestinyCards: string[];
};

type PlayerInterceptors = {
  unlockedAffinities: Interceptable<Affinity[]>;
  cardsDrawnForTurn: Interceptable<number>;
};
const makeInterceptors = (): PlayerInterceptors => {
  return {
    unlockedAffinities: new Interceptable<Affinity[]>(),
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

  private readonly _unlockedAffinities: Affinity[] = [AFFINITIES.NORMAL];

  readonly cardTracker: CardTrackerComponent;

  private _hero!: HeroCard;

  readonly unlockedDestinyCards: DestinyCard[] = [];

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
    this._hero = await this.generateCard<HeroCard>(this.options.hero);
    await this._hero.play();
    await this.cardManager.init();
    this._hero.unlockableAffinities.forEach(affinity => {
      this._unlockedAffinities.push(affinity);
    });
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
      unlockedAffinities: this.unlockedAffinities,
      influence: this.influence,
      unlockedDestinyCards: this.unlockedDestinyCards.map(card => card.id)
    };
  }

  get cardsDrawnForTurn() {
    const isFirstTurn = this.game.gamePhaseSystem.elapsedTurns === 0;

    if (isFirstTurn) {
      return this.interceptors.cardsDrawnForTurn.getValue(
        this.game.gamePhaseSystem.currentPlayer.isPlayer1
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
    return this._hero;
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

  get unlockedAffinities() {
    return this.interceptors.unlockedAffinities.getValue(this._unlockedAffinities, {});
  }

  get isCurrentPlayer() {
    return this.game.gamePhaseSystem.currentPlayer.equals(this);
  }

  get influence() {
    return this.cardManager.hand.length + this.cardManager.destinyZone.size;
  }

  async unlockAffinity(affinity: Affinity) {
    this._unlockedAffinities.push(affinity);
    await this.game.emit(
      GAME_EVENTS.PLAYER_UNLOCK_AFFINITY,
      new PlayerUnlockAffinityEvent({
        player: this,
        affinity
      })
    );
  }

  async removeAffinity(affinity: Affinity) {
    const index = this._unlockedAffinities.indexOf(affinity);
    assert(index !== -1, new CardNotFoundError());
    this._unlockedAffinities.splice(index, 1);
  }

  private payForManaCost(card: AnyCard, indices: number[]) {
    const hasEnough = this.cardManager.hand.length >= card.manaCost;
    assert(hasEnough, new NotEnoughCardsInHandError());
    const cards = this.cardManager.hand.filter((_, i) => indices.includes(i));
    cards.forEach(card => {
      card.sendToDestinyZone();
    });
  }

  async playMainDeckCard(card: MainDeckCard, manaCostIndices: number[]) {
    this.payForManaCost(card, manaCostIndices);
    await card.play();
  }

  async playDestinyCard(card: DestinyCard) {
    await this.payForDestinyCost(card.destinyCost);
    await card.play();
    this.unlockedDestinyCards.push(card);
  }

  private async payForDestinyCost(cost: number) {
    const prioritizedCards = Array.from(this.cardManager.discardPile).filter(
      card => card.canBeUsedAsDestinyCost
    );
    const pool = [...this.cardManager.destinyZone, ...prioritizedCards];
    const hasEnough = pool.length >= cost;
    assert(hasEnough, new NotEnoughCardsInDestinyZoneError());

    const banishedCards: Array<{ card: MainDeckCard; index: number }> = [];
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
