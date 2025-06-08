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
import type { TalentCard } from '../card/entities/talent.entity';
import { AFFINITIES, type Affinity } from '../card/card.enums';
import { CardTrackerComponent } from './components/cards-tracker.component';
import { Interceptable } from '../utils/interceptable';
import { GAME_EVENTS } from '../game/game.events';
import { PlayerTurnEvent } from './player.events';
import type { MainDeckCard } from '../board/board.system';
import { novice } from '../card/sets/core/heroes/novice';

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
  discardPile: string[];
  banishPile: string[];
  destinyZone: string[];
  remainingCardsInDeck: number;
  destinyDeck: string[];
  maxHp: number;
  currentHp: number;
  isPlayer1: boolean;
  unlockedAffinities: Affinity[];
};

type PlayerInterceptors = {
  unlockedAffinities: Interceptable<Affinity[]>;
};
const makeInterceptors = (): PlayerInterceptors => {
  return {
    unlockedAffinities: new Interceptable<Affinity[]>()
  };
};

export class Player
  extends Entity<PlayerInterceptors>
  implements Serializable<SerializedPlayer>
{
  private game: Game;

  readonly boardSide: BoardSide;

  readonly cardManager: CardManagerComponent;

  readonly artifactManager: ArtifactManagerComponent;

  private readonly _unlockedAffinities: Affinity[] = [AFFINITIES.NORMAL];

  readonly cardTracker: CardTrackerComponent;

  readonly talents: TalentCard[] = [];

  private _hero!: HeroCard;

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
    this.artifactManager = new ArtifactManagerComponent(game, this);
  }

  async init() {
    this._hero = await this.generateCard<HeroCard>(novice.id);
    await this.cardManager.init();
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
      destinyDeck: this.cardManager.destinyDeck.cards.map(card => card.id),
      maxHp: this.hero.maxHp,
      currentHp: this.hero.remainingHp,
      isPlayer1: this.isPlayer1,
      unlockedAffinities: this.unlockedAffinities
    };
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

  get isTurnPlayer() {
    return this.game.gamePhaseSystem.turnPlayer.equals(this);
  }

  async unlockAffinity(affinity: Affinity) {
    this._unlockedAffinities.push(affinity);
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

  private payForDestinyCost(card: AnyCard) {
    const hasEnough = this.cardManager.destinyZone.size >= card.destinyCost;
    assert(hasEnough, new NotEnoughCardsInDestinyZoneError());
    const cost = card.destinyCost;

    for (let i = 0; i < cost; i++) {
      const index = this.game.rngSystem.nextInt(this.cardManager.destinyZone.size);
      const card = [...this.cardManager.destinyZone][index];
      card.sendToBanishPile();
    }
  }

  async playDestinyDeckCardAtIndex(index: number) {
    const card = this.cardManager.getDestinyCardAt(index);
    assert(isDefined(card), new CardNotFoundError());

    this.payForDestinyCost(card);
    await card.play();
  }

  canAddTalent(talent: TalentCard) {
    return (
      this.talents.length < this.game.config.MAX_TALENTS &&
      talent.level <= this.hero.level
    );
  }

  addTalent(talent: TalentCard) {
    this.talents.push(talent);
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

  generateCard<T extends AnyCard = AnyCard>(blueprintId: string) {
    const card = this.game.cardSystem.addCard<T>(this, blueprintId);

    return card;
  }
}
