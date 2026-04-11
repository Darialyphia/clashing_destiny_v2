import {
  CardManagerComponent,
  type DeckCard
} from '../card/components/card-manager.component';
import { Entity } from '../entity';
import { type Game } from '../game/game';
import { type Nullable, type Serializable } from '@game/shared';
import { ArtifactManagerComponent } from './components/artifact-manager.component';
import type { AnyCard } from '../card/entities/card.entity';
import { CardTrackerComponent } from './components/cards-tracker.component';
import { Interceptable } from '../utils/interceptable';
import {
  PlayerDamageEvent,
  PlayerHealEvent,
  PlayerManaChangeEvent,
  PlayerPlayCardEvent,
  PlayerResourceActionEvent
} from './player.events';
import { ModifierManager } from '../modifier/modifier-manager.component';
import { PLAYER_EVENTS } from './player.enums';
import { CARD_EVENTS, CARD_KINDS, type Rune } from '../card/card.enums';
import type { SerializedPlayerArtifact } from './player-artifact.entity';
import { RuneManagerComponent } from './components/rune-manager.component';
import type { Damage } from '../utils/damage';
import { LevelManagerComponent } from './components/level-manager.component';

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
  canUseResourceAction: boolean;
  artifacts: SerializedPlayerArtifact[];
  runes: Partial<Record<Rune, number>>;
  manaRegen: number;
  exp: number;
  level: number;
  expToNextLevel: number;
  maxLevel: number;
};

export type PlayerInterceptor = {
  cardsDrawnForTurn: Interceptable<number>;
  maxManathreshold: Interceptable<number>;
  maxMana: Interceptable<number>;
  manaRegen: Interceptable<number>;
  damageReceived: Interceptable<
    number,
    { damage: Damage; amount: number; source: AnyCard }
  >;
};
const makeInterceptors = (): PlayerInterceptor => {
  return {
    cardsDrawnForTurn: new Interceptable(),
    maxMana: new Interceptable(),
    manaRegen: new Interceptable(),
    maxManathreshold: new Interceptable(),
    damageReceived: new Interceptable()
  };
};

export type ResourceAction =
  | {
      type: 'gainRune';
      rune: Rune;
    }
  | {
      type: 'draw';
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

  readonly runeManager: RuneManagerComponent;

  readonly levelManager: LevelManagerComponent;

  currentlyPlayedCard: Nullable<DeckCard> = null;

  currentlyPlayedCardIndexInHand: Nullable<number> = null;

  private _mana = 0;

  private _baseMaxMana = 0;

  private _resourceActionsDoneThisTurn = 0;

  hasPassedThisRound = false;

  damageTaken = 0;

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
    this.runeManager = new RuneManagerComponent(game, this);
    this.levelManager = new LevelManagerComponent(game, this);
  }

  async init() {
    this._baseMaxMana = this.game.config.MAX_MANA;
    this.refillMana();

    await this.cardManager.init();
  }

  get maxHp() {
    return this.game.config.PLAYER_MAX_HP;
  }

  get remainingHp() {
    return this.maxHp - this.damageTaken;
  }

  get frontRowIndex() {
    return this.isPlayer1 ? 1 : 3;
  }

  get unitsInFrontRow() {
    return this.units.filter(unit => unit.position.x === this.frontRowIndex);
  }

  get backRowIndex() {
    return this.isPlayer1 ? 0 : 4;
  }

  get unitsInBackRow() {
    return this.units.filter(unit => unit.position.x === this.backRowIndex);
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
      currentMana: this._mana,
      maxMana: this.maxMana,
      manaRegen: this.manaRegen,
      deckSize: this.cardManager.deck.cards.length,
      isActive: this.isActive,
      equipedArtifacts: this.artifactManager.artifacts.map(artifact => artifact.id),
      currentlyPlayedCard: this.currentlyPlayedCard?.id ?? null,
      canUseResourceAction: this.canPerformResourceAction,
      artifacts: this.artifactManager.artifacts.map(artifact => artifact.serialize()),
      runes: this.runeManager.runes,
      exp: this.levelManager.exp,
      level: this.levelManager.level,
      maxLevel: this.game.config.PLAYER_MAX_LEVEL,
      expToNextLevel:
        this.levelManager.level < this.game.config.PLAYER_MAX_LEVEL
          ? this.game.config.EXP_PER_LEVEL - this.levelManager.exp
          : 0
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

  get canPerformResourceAction() {
    return (
      this._resourceActionsDoneThisTurn < this.game.config.MAX_RESOURCE_ACTIONS_PER_TURN
    );
  }

  async performResourceAction(action: ResourceAction) {
    if (!this.canPerformResourceAction) {
      throw new Error('No resource actions remaining for this turn');
    }

    await this.game.emit(
      PLAYER_EVENTS.PLAYER_BEFORE_PERFORM_RESOURCE_ACTION,
      new PlayerResourceActionEvent({ player: this, action })
    );

    switch (action.type) {
      case 'draw':
        await this.cardManager.drawFromDeck(1);
        break;
      case 'gainRune':
        await this.runeManager.gainRune({ [action.rune]: 1 });
        break;
    }

    this._resourceActionsDoneThisTurn++;

    await this.game.emit(
      PLAYER_EVENTS.PLAYER_AFTER_PERFORM_RESOURCE_ACTION,
      new PlayerResourceActionEvent({ player: this, action })
    );
  }

  refillMana() {
    this._mana = Math.min(this._mana + this.manaRegen, this.maxMana);
  }

  async startTurn() {
    this._resourceActionsDoneThisTurn = 0;
    this.hasPassedThisRound = false;

    this.refillMana();

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
      PLAYER_EVENTS.PLAYER_BEFORE_MANA_CHANGE,
      new PlayerManaChangeEvent({ player: this, amount })
    );
    this._mana = Math.max(this._mana - amount, 0);
    await this.game.emit(
      PLAYER_EVENTS.PLAYER_AFTER_MANA_CHANGE,
      new PlayerManaChangeEvent({ player: this, amount })
    );
  }

  async gainMana(amount: number) {
    if (amount === 0) return;
    await this.game.emit(
      PLAYER_EVENTS.PLAYER_BEFORE_MANA_CHANGE,
      new PlayerManaChangeEvent({ player: this, amount })
    );
    this._mana = this._mana + amount; // dont clamp to max mana because of effects that go over max mana (ex: mana tile)
    await this.game.emit(
      PLAYER_EVENTS.PLAYER_AFTER_MANA_CHANGE,
      new PlayerManaChangeEvent({ player: this, amount })
    );
  }

  canSpendMana(amount: number) {
    return this.mana >= amount;
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
    return this.interceptors.damageReceived.getValue(damage.baseAmount, {
      damage,
      amount: damage.baseAmount,
      source
    });
  }

  async takeDamage(source: AnyCard, damage: Damage) {
    await this.game.emit(
      PLAYER_EVENTS.PLAYER_BEFORE_TAKE_DAMAGE,
      new PlayerDamageEvent({
        player: this,
        damage,
        from: source
      })
    );
    const finalDamage = this.getReceivedDamage(damage, source);
    this.damageTaken += finalDamage;
    await this.game.emit(
      PLAYER_EVENTS.PLAYER_AFTER_TAKE_DAMAGE,
      new PlayerDamageEvent({
        player: this,
        damage,
        from: source
      })
    );
  }

  async heal(source: AnyCard, amount: number) {
    await this.game.emit(
      PLAYER_EVENTS.PLAYER_BEFORE_HEAL,
      new PlayerHealEvent({ player: this, amount, source })
    );
    this.damageTaken = Math.max(this.damageTaken - amount, 0);
    await this.game.emit(
      PLAYER_EVENTS.PLAYER_AFTER_HEAL,
      new PlayerHealEvent({ player: this, amount, source })
    );
  }
}
