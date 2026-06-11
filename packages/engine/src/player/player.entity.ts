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
import type { Affinity } from '../card/card.enums';
import { isMinion } from '../card/card-utils';
import { RuneManagerComponent } from './components/rune-manager.component';
import type { Rune } from './player.enums';
import { match } from 'ts-pattern';
import { BoardSide, type SerializedBoardSide } from '../board/board-side.entity';

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
  maxHp: number;
  currentHp: number;
  isPlayer1: boolean;
  maxMana: number;
  currentMana: number;
  manaRegen: number;
  hero: string;
  unlockedAffinities: Affinity[];
  boardSide: SerializedBoardSide;
};

export type PlayerInterceptors = {
  cardsDrawnForTurn: Interceptable<number>;
  manaRegen: Interceptable<number>;
  maxMana: Interceptable<number>;
  unlockedAffinities: Interceptable<Affinity[]>;
  maxResourceActionsPerTurn: Interceptable<number>;
};

const makeInterceptors = (): PlayerInterceptors => {
  return {
    cardsDrawnForTurn: new Interceptable(),
    manaRegen: new Interceptable(),
    maxMana: new Interceptable(),
    unlockedAffinities: new Interceptable<Affinity[]>(),
    maxResourceActionsPerTurn: new Interceptable<number>()
  };
};

export type PlayerResourceAction = { type: 'rune'; rune: Rune } | { type: 'draw' };

export class Player
  extends EntityWithModifiers<PlayerInterceptors>
  implements Serializable<SerializedPlayer>
{
  readonly cardManager: CardManagerComponent;

  readonly cardTracker: CardTrackerComponent;

  readonly runeManager: RuneManagerComponent;

  readonly manaManager = new ManaManagerComponent(this.game, this, {
    manaRegen: this.interceptors.manaRegen,
    maxMana: this.interceptors.maxMana
  });

  readonly boardSide: BoardSide;

  private options: PlayerOptions;

  hasPassedThisRound = false;

  resourceActionsTakenThisTurn: PlayerResourceAction[] = [];

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
    this.runeManager = new RuneManagerComponent(game, this);
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

  get minionsInLeftBattlefield() {
    return this.boardSide.leftBattlefield
      .map(space => space.card)
      .filter(isDefined)
      .filter(isMinion);
  }

  get minionsInRightBattlefield() {
    return this.boardSide.rightBattlefield
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
    return [this.hero, ...this.minionsInBase, ...this.minionsInBattlefield].filter(
      isDefined
    );
  }

  get enemyMinions() {
    return this.opponent.minions;
  }

  get unlockedAffinities() {
    return this.interceptors.unlockedAffinities.getValue(this.hero.affinities, {});
  }

  get maxResourceActionsPerTurn() {
    return this.interceptors.maxResourceActionsPerTurn.getValue(
      this.game.config.MAX_RESOURCE_ACTIONS_PER_TURN,
      {}
    );
  }

  canTakeResourceAction() {
    return this.resourceActionsTakenThisTurn.length < this.maxResourceActionsPerTurn;
  }

  async takeResourceAction(action: PlayerResourceAction) {
    this.resourceActionsTakenThisTurn.push(action);
    await match(action)
      .with({ type: 'rune' }, async ({ rune }) => {
        await this.runeManager.addRunes([rune]);
      })
      .with({ type: 'draw' }, async () => {
        await this.cardManager.draw(1);
      })
      .exhaustive();
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
      await this.manaManager.gain(this.manaManager.manaRegen);
      this.resourceActionsTakenThisTurn = [];
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
      maxHp: this.hero.maxHp,
      currentHp: this.hero.remainingHp,
      isPlayer1: this.isPlayer1,
      currentMana: this.mana,
      maxMana: this.maxMana,
      manaRegen: this.manaRegen,
      hero: this.hero.id,
      unlockedAffinities: this.unlockedAffinities,
      boardSide: this.boardSide.serialize()
    };
  }
}
