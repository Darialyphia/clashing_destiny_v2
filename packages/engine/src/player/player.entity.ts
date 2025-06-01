import { BoardSide } from '../board/board-side.entity';
import { CardManagerComponent } from '../card/components/card-manager.component';
import { Entity } from '../entity';
import { type Game } from '../game/game';
import { assert, isDefined, type EmptyObject, type Serializable } from '@game/shared';
import { ArtifactManagerComponent } from './components/artifact-manager.component';
import type { AnyCard } from '../card/entities/card.entity';
import {
  CardNotFoundError,
  NotEnoughCardsInDestinyZoneError,
  NotEnoughCardsInHandError
} from '../card/card-errors';
import type { HeroCard } from '../card/entities/hero.entity';
import type { TalentCard } from '../card/entities/talent.entity';
import { type Affinity } from '../card/card.enums';
import { CardTrackerComponent } from './components/cards-tracke.component';

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
};

type PlayerInterceptors = EmptyObject;
const makeInterceptors = (): PlayerInterceptors => {
  return {};
};

export class Player
  extends Entity<PlayerInterceptors>
  implements Serializable<SerializedPlayer>
{
  private game: Game;

  readonly boardSide: BoardSide;

  readonly cardManager: CardManagerComponent;

  readonly artifactManager: ArtifactManagerComponent;

  readonly unlockedAffinities: Affinity[] = [];

  readonly cardTracker: CardTrackerComponent;

  readonly talents: TalentCard[] = [];

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
      maxHandSize: 5,
      shouldShuffleDeck: true
    });
    this.artifactManager = new ArtifactManagerComponent(game, this);
  }

  init() {
    return this.cardManager.init();
  }

  serialize() {
    return {
      id: this.id,
      entityType: 'player' as const,
      name: this.options.name
    };
  }

  get isPlayer1() {
    return this.game.playerSystem.player1.equals(this);
  }

  get opponent() {
    return this.game.playerSystem.players.find(p => !p.equals(this))!;
  }

  get hero() {
    return {} as HeroCard;
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

  get isTurnPlayer() {
    return this.game.gamePhaseSystem.turnPlayer.equals(this);
  }

  async unlockAffinity(affinity: Affinity) {
    this.unlockedAffinities.push(affinity);
  }

  private payForManaCost(card: AnyCard, indices: number[]) {
    const hasEnough = this.cardManager.hand.length >= card.manaCost;
    assert(hasEnough, new NotEnoughCardsInHandError());
    const cards = this.cardManager.hand.filter((_, i) => indices.includes(i));
    cards.forEach(card => {
      card.sendToDestinyZone();
    });
  }

  async playMainDeckCardAtIndex(index: number, manaCostIndices: number[]) {
    const card = this.cardManager.getCardInHandAt(index);
    assert(isDefined(card), new CardNotFoundError());

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
    for (const card of this.boardSide.getAllCardsInPlay()) {
      await card.wakeUp();
    }
  }

  endTurn() {}

  generateCard<T extends AnyCard = AnyCard>(blueprintId: string) {
    const card = this.game.cardSystem.addCard<T>(this, blueprintId);

    return card;
  }
}
