import { CardManagerComponent } from '../card/components/card-manager.component';
import { type Game } from '../game/game';
import { assert, isDefined, type MaybePromise, type Serializable } from '@game/shared';
import type { AnyCard } from '../card/entities/card.entity';
import { NotEnoughManaError } from '../card/card-errors';
import { CardTrackerComponent } from './components/cards-tracker.component';
import { Interceptable } from '../utils/interceptable';
import type { Ability, AbilityOwner } from '../card/entities/ability.entity';
import { EntityWithModifiers } from '../modifier/entity-with-modifiers';
import { LockedModifier } from '../modifier/modifiers/locked.modifier';
import { cloneDeep } from 'lodash-es';
import { LevelManagerComponent } from './components/level-manager.component';
import { ManaManagerComponent } from './components/mana-manager.component';
import type { Affinity } from '../card/card.enums';
import { isMinion } from '../card/card-utils';

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
  unlockedAffinities: Affinity[];
};

export type PlayerInterceptors = {
  cardsDrawnForTurn: Interceptable<number>;
  manaRegen: Interceptable<number>;
  maxMana: Interceptable<number>;
  unlockedAffinities: Interceptable<Affinity[]>;
};

const makeInterceptors = (): PlayerInterceptors => {
  return {
    cardsDrawnForTurn: new Interceptable(),
    manaRegen: new Interceptable(),
    maxMana: new Interceptable(),
    unlockedAffinities: new Interceptable()
  };
};

export type PlayerResourceAction = { type: 'rune' } | { type: 'draw' };

export class Player
  extends EntityWithModifiers<PlayerInterceptors>
  implements Serializable<SerializedPlayer>
{
  readonly cardManager: CardManagerComponent;

  readonly cardTracker: CardTrackerComponent;

  readonly levelManager: LevelManagerComponent;

  readonly manaManager = new ManaManagerComponent(this.game, this, {
    manaRegen: this.interceptors.manaRegen,
    maxMana: this.interceptors.maxMana
  });

  private options: PlayerOptions;

  hasPassedThisRound = false;

  constructor(game: Game, options: PlayerOptions) {
    super(options.id, game, makeInterceptors());
    this.options = cloneDeep(options);
    this.game = game;
    this.cardTracker = new CardTrackerComponent(game, this);
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

  get level() {
    return this.levelManager.level;
  }

  get enemyHero() {
    return this.opponent.hero;
  }

  get frontRowIndex() {
    return this.isPlayer1 ? 2 : 1;
  }

  get frontRow() {
    return this.game.boardSystem.getRow(this.frontRowIndex);
  }

  get cardsInFrontRow() {
    return this.frontRow.map(space => space.occupant).filter(isDefined);
  }

  get minionsInFrontRow() {
    return this.cardsInFrontRow.filter(isMinion);
  }

  get backRowIndex() {
    return this.isPlayer1 ? 3 : 0;
  }

  get backRow() {
    return this.game.boardSystem.getRow(this.backRowIndex);
  }

  get cardsInBackRow() {
    return this.backRow.map(space => space.occupant).filter(isDefined);
  }

  get minionsInBackRow() {
    return this.cardsInBackRow.filter(isMinion);
  }

  get allCardsInPlay() {
    return [...this.cardsInFrontRow, ...this.cardsInBackRow];
  }

  get minions() {
    return [...this.minionsInFrontRow, ...this.minionsInBackRow];
  }

  get enemyMinions() {
    return this.opponent.minions;
  }

  get unlockedAffinities() {
    return this.interceptors.unlockedAffinities.getValue(
      this.levelManager.level > this.game.config.ADVANCED_AFFINITY_UNLOCK_LEVEL
        ? [this.hero.affinity, this.hero.advancedAffinity]
        : [this.hero.affinity],
      {}
    );
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
    this.hasPassedThisRound = true;
  }

  async startTurn() {
    this.hasPassedThisRound = false;

    for (const card of this.allCardsInPlay) {
      if (card.shouldWakeUpAtTurnStart) {
        await card.wakeUp();
      }
    }
    if (this.game.turnSystem.elapsedTurns > 0) {
      await this.levelManager.gainExp(this.game.config.EXP_GAIN_PER_TURN);
      await this.manaManager.gain(this.manaManager.manaRegen);
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
      unlockedAffinities: this.unlockedAffinities
    };
  }
}
