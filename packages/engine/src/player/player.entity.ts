import {
  CardManagerComponent,
  type DeckCard
} from '../card/components/card-manager.component';
import { Entity } from '../entity';
import { type Game } from '../game/game';
import { type Nullable, type Point, type Serializable } from '@game/shared';
import { ArtifactManagerComponent } from './components/artifact-manager.component';
import type { AnyCard } from '../card/entities/card.entity';
import { CardTrackerComponent } from './components/cards-tracker.component';
import { Interceptable } from '../utils/interceptable';
import { PlayerHealEvent, PlayerPlayCardEvent } from './player.events';
import { ManaManagerComponent } from './components/mana-manager.component';
import { ModifierManager } from '../modifier/modifier-manager.component';
import { PLAYER_EVENTS } from './player.enums';
import { CARD_EVENTS, CARD_KINDS } from '../card/card.enums';
import type { SerializedPlayerArtifact } from './player-artifact.entity';
import type { Damage } from '../utils/damage';
import { LevelManagerComponent } from './components/level-manager.component';
import type { Unit } from '../unit/unit.entity';
import { CombatComponent } from '../combat/combat.component';
import { COMBAT_EVENTS, CombatDoneEvent } from '../combat/combat.events';

export type PlayerOptions = {
  id: string;
  name: string;
  deck: { cards: { blueprintId: string; isFoil: boolean }[] };
};

export type SerializedPlayer = {
  id: string;
  entityType: 'player';
  name: string;
  hand: string[];
  handSize: number;
  discardPile: string[];
  remainingCardsInDeck: string[];
  remainingCountInDeck: number;
  isPlayer1: boolean;
  maxHp: number;
  currentHp: number;
  currentMana: number;
  maxMana: number;
  deckSize: number;
  isActive: boolean;
  equipedArtifacts: string[];
  currentlyPlayedCard: string | null;
  artifacts: SerializedPlayerArtifact[];
  manaRegen: number;
  exp: number;
  level: number;
  maxLevel: number;
  frontRow: string[];
  backRow: string[];
  hero: string | null;
};

export type PlayerInterceptor = {
  cardsDrawnForTurn: Interceptable<number>;
  maxManathreshold: Interceptable<number>;
  maxMana: Interceptable<number>;
  manaRegen: Interceptable<number>;
  canAttack: Interceptable<boolean, { target: Unit | Player }>;
  canCounterAttack: Interceptable<boolean, { attacker: Player | Unit }>;
  canBeAttackTarget: Interceptable<boolean, { attacker: Player | Unit }>;
  canBeCounterattackTarget: Interceptable<boolean, { attacker: Player | Unit }>;
  maxAttacksPerTurn: Interceptable<number>;
  dealsDamageFirstWhenAttacking: Interceptable<boolean>;
  shouldSwitchInitiativeafterAttacking: Interceptable<boolean>;
};

const makeInterceptors = (): PlayerInterceptor => {
  return {
    cardsDrawnForTurn: new Interceptable(),
    maxMana: new Interceptable(),
    manaRegen: new Interceptable(),
    maxManathreshold: new Interceptable(),
    canAttack: new Interceptable(),
    canCounterAttack: new Interceptable(),
    canBeAttackTarget: new Interceptable(),
    canBeCounterattackTarget: new Interceptable(),
    dealsDamageFirstWhenAttacking: new Interceptable(),
    maxAttacksPerTurn: new Interceptable(),
    shouldSwitchInitiativeafterAttacking: new Interceptable()
  };
};

export class Player
  extends Entity<PlayerInterceptor>
  implements Serializable<SerializedPlayer>
{
  private game: Game;

  readonly cardManager: CardManagerComponent;

  readonly modifiers: ModifierManager<Player>;

  readonly artifactManager: ArtifactManagerComponent;

  readonly cardTracker: CardTrackerComponent;

  readonly levelManager: LevelManagerComponent;

  readonly manaManager: ManaManagerComponent;

  readonly combat: CombatComponent;

  private _damageTaken = 0;

  currentlyPlayedCard: Nullable<DeckCard> = null;

  currentlyPlayedCardIndexInHand: Nullable<number> = null;

  hasPassedThisRound = false;

  constructor(
    game: Game,
    private options: PlayerOptions
  ) {
    super(options.id, makeInterceptors());
    this.game = game;
    this.cardTracker = new CardTrackerComponent(game, this);
    this.cardManager = new CardManagerComponent(game, this, {
      deck: this.options.deck.cards,
      maxHandSize: this.game.config.MAX_HAND_SIZE,
      shouldShuffleDeck: true
    });
    this.modifiers = new ModifierManager<Player>(game, this);
    this.artifactManager = new ArtifactManagerComponent(game, this);
    this.levelManager = new LevelManagerComponent(game, this);
    this.manaManager = new ManaManagerComponent(game, this, {
      maxMana: this.interceptors.maxMana,
      manaRegen: this.interceptors.manaRegen
    });
    this.combat = new CombatComponent(game, this);
  }

  async init() {
    this.manaManager.init();

    await this.cardManager.init();
  }

  get maxHp() {
    return this.hero?.maxHp ?? 0;
  }

  get damageTaken() {
    return this._damageTaken;
  }

  get remainingHp() {
    return this.maxHp - this._damageTaken;
  }

  get frontRowIndex() {
    return this.isPlayer1 ? 2 : 1;
  }

  get frontRow() {
    return this.game.boardSystem.getRow(this.frontRowIndex);
  }

  get unitsInFrontRow() {
    return this.units.filter(unit => unit.position.x === this.frontRowIndex);
  }

  get backRowIndex() {
    return this.isPlayer1 ? 3 : 0;
  }

  get backRow() {
    return this.game.boardSystem.getRow(this.backRowIndex);
  }

  get unitsInBackRow() {
    return this.units.filter(unit => unit.position.x === this.backRowIndex);
  }

  get hero() {
    return this.cardManager.hero;
  }

  get level() {
    return this.levelManager.level;
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
      remainingCardsInDeck: [...this.cardManager.deck.cards]
        .sort((a, b) => {
          if (a.manaCost === b.manaCost) {
            return a.blueprint.name.localeCompare(b.blueprint.name);
          }
          return a.manaCost - b.manaCost;
        })
        .map(card => card.id),
      remainingCountInDeck: this.cardManager.deck.cards.length,
      isPlayer1: this.isPlayer1,
      maxHp: this.maxHp,
      currentHp: this.remainingHp,
      currentMana: this.mana,
      maxMana: this.maxMana,
      manaRegen: this.manaRegen,
      deckSize: this.cardManager.deck.cards.length,
      isActive: this.isActive,
      equipedArtifacts: this.artifactManager.artifacts.map(artifact => artifact.id),
      currentlyPlayedCard: this.currentlyPlayedCard?.id ?? null,
      artifacts: this.artifactManager.artifacts.map(artifact => artifact.serialize()),
      exp: this.levelManager.exp,
      level: this.levelManager.level,
      maxLevel: this.game.config.PLAYER_MAX_LEVEL,
      frontRow: this.frontRow.map(cell => cell.id),
      backRow: this.backRow.map(cell => cell.id),
      hero: this.hero?.id ?? null
    };
  }

  get isCurrentPlayer() {
    return this.game.turnSystem.initiativePlayer.equals(this);
  }

  get cardsDrawnForTurn() {
    return this.interceptors.cardsDrawnForTurn.getValue(
      this.game.config.CARDS_DRAWN_PER_TURN,
      {}
    );
  }

  get isPlayer1() {
    return this.game.playerSystem.player1.equals(this);
  }

  get isActive() {
    return this.game.turnSystem.initiativePlayer.equals(this);
  }

  get opponent() {
    return this.game.playerSystem.players.find(p => !p.equals(this))!;
  }

  get units() {
    return this.game.unitSystem
      .getUnitsByPlayer(this)
      .filter(unit => unit.card.kind === CARD_KINDS.MINION);
  }

  get enemyUnits() {
    return this.opponent.units;
  }

  get isTurnPlayer() {
    return this.game.turnSystem.initiativePlayer.equals(this);
  }

  async startTurn() {
    this.hasPassedThisRound = false;

    this.manaManager.refillMana();

    if (this.game.config.DRAW_STEP === 'turn-start') {
      await this.drawForTurn();
    }

    for (const minion of this.units) {
      if (minion.shouldActivateOnTurnStart) {
        minion.activate();
      }
    }

    await this.levelManager.gainExp(this.game.config.EXP_GAIN_PER_TURN);
  }

  async endTurn() {
    if (this.game.config.DRAW_STEP === 'turn-end') {
      await this.drawForTurn();
    }
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

  spendMana(amount: number) {
    return this.manaManager.spendMana(amount);
  }

  gainMana(amount: number) {
    return this.manaManager.gainMana(amount);
  }

  canSpendMana(amount: number) {
    return this.manaManager.canSpendMana(amount);
  }

  generateCard<T extends AnyCard = AnyCard>(
    blueprintId: string,
    isFoil: boolean
  ): Promise<T> {
    const card = this.game.cardSystem.addCard<T>(this, blueprintId, isFoil);

    return card;
  }

  private async onBeforePlayFromHand(card: DeckCard) {
    await this.game.emit(
      PLAYER_EVENTS.PLAYER_BEFORE_PLAY_CARD,
      new PlayerPlayCardEvent({ player: this, card })
    );
    await this.spendMana(card.manaCost);
  }

  playCardFromHand(card: DeckCard) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise<{ cancelled: boolean }>(async resolve => {
      this.currentlyPlayedCard = card;
      this.currentlyPlayedCardIndexInHand = this.cardManager.hand.indexOf(card);
      const stop = card.once(
        CARD_EVENTS.CARD_BEFORE_PLAY,
        this.onBeforePlayFromHand.bind(this, card)
      );
      await card.play(async () => {
        this.currentlyPlayedCard = null;
        this.currentlyPlayedCardIndexInHand = null;
        resolve({ cancelled: true });
      });
      await this.game.emit(
        PLAYER_EVENTS.PLAYER_AFTER_PLAY_CARD,
        new PlayerPlayCardEvent({ player: this, card })
      );
      stop();
      this.currentlyPlayedCard = null;
      this.currentlyPlayedCardIndexInHand = null;
      resolve({ cancelled: false });
    });
  }

  async drawForTurn() {
    await this.cardManager.drawFromDeck(this.cardsDrawnForTurn);
  }

  passTurn() {
    this.hasPassedThisRound = true;
  }

  getReceivedDamage(damage: Damage, source: AnyCard) {
    return this.hero.getReceivedDamage(damage, source);
  }

  async takeDamage(source: AnyCard, damage: Damage) {
    return this.combat.takeDamage(source, damage);
  }

  async heal(source: AnyCard, amount: number) {
    await this.game.emit(
      PLAYER_EVENTS.PLAYER_BEFORE_HEAL,
      new PlayerHealEvent({ player: this, amount, source })
    );
    this._damageTaken = Math.max(this._damageTaken - amount, 0);
    await this.game.emit(
      PLAYER_EVENTS.PLAYER_AFTER_HEAL,
      new PlayerHealEvent({ player: this, amount, source })
    );
  }

  get atk() {
    return this.hero.atk;
  }

  getAttackDamage(target: Unit | Player) {
    return this.hero.getAttackDamage(target);
  }

  get retaliation() {
    return this.hero.retaliation;
  }

  getRetaliationDamage(attacker: Unit | Player) {
    return this.hero.getRetaliationDamage(attacker);
  }

  get counterattackAOEShape() {
    return this.hero.counterattackAOEShape;
  }

  get attackAOEShape() {
    return this.hero.attackAOEShape;
  }

  get dealsDamageFirstWhenAttacking() {
    return this.interceptors.dealsDamageFirstWhenAttacking.getValue(false, {});
  }

  getCounterattackParticipants(initialTarget: Unit) {
    return [initialTarget];
  }

  canBeCounterattackedBy(unit: Unit | Player): boolean {
    return this.interceptors.canBeCounterattackTarget.getValue(true, {
      attacker: unit
    });
  }

  canCounterAttack(unit: Unit | Player): boolean {
    return this.interceptors.canCounterAttack.getValue(true, { attacker: unit });
  }

  async counterAttack(attacker: Unit | Player) {
    return this.combat.counterAttack(attacker);
  }

  get shouldSwitchInitiativeafterAttacking() {
    return this.interceptors.shouldSwitchInitiativeafterAttacking.getValue(true, {});
  }

  async attack(point: Point) {
    const target = this.game.unitSystem.getUnitAt(point) ?? this.opponent;
    await this.combat.attack(target);
    if (this.combat.attacksCount >= this.maxAttacksPerTurn) {
      this.hero.exhaust();
    }
    await this.game.emit(
      COMBAT_EVENTS.COMBAT_DONE,
      new CombatDoneEvent({ attacker: this })
    );

    if (this.shouldSwitchInitiativeafterAttacking) {
      await this.game.turnSystem.switchInitiative();
    }
  }

  async removeHp(amount: number) {
    this._damageTaken = Math.min(this.damageTaken + amount, this.maxHp);
  }

  get maxAttacksPerTurn() {
    return this.interceptors.maxAttacksPerTurn.getValue(
      this.game.config.MAX_ATTACKS_PER_TURN,
      {}
    );
  }

  canAttack(target: Unit | Player): boolean {
    return this.interceptors.canAttack.getValue(
      this.combat.attacksCount < this.maxAttacksPerTurn &&
        !this.hero.isExhausted &&
        this.atk > 0,
      { target }
    );
  }
}
