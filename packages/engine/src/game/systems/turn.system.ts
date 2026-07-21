import type { Player } from '../../player/player.entity';
import { TypedSerializableEvent } from '../../utils/typed-emitter';
import { TURN_EVENTS } from '../game.enums';
import { System } from '../../system';
import { GAME_EVENTS } from '../game.events';

export type TurnEventMap = {
  [TURN_EVENTS.TURN_START]: TurnEvent;
  [TURN_EVENTS.TURN_END]: TurnEvent;
  [TURN_EVENTS.TURN_INITATIVE_CHANGE]: TurnInitiativeChangeEvent;
  [TURN_EVENTS.TURN_PASS]: TurnPassEvent;
};

// Input types that do NOT reset consecutive pass count in non-definitive pass mode
const PASS_RESET_EXEMPT_INPUTS = new Set(['pass', 'declarePlayCard', 'surrender']);

export class TurnSystem extends System<never> {
  private _elapsedTurns = 0;

  // the initiative player is the one that can take an action
  private _initiativePlayer!: Player;

  private _nextInitiativePlayer!: Player;

  // DEFINITIVE_PASSES = true: tracks first player to pass, to determine next turn's initiative
  private firstPlayerToPassThisRound: Player | null = null;

  // DEFINITIVE_PASSES = false: counts consecutive passes; turn ends when both players pass back-to-back
  private consecutivePassCount = 0;

  async initialize() {
    // const idx = this.game.rngSystem.nextInt(this.game.playerSystem.players.length);
    this._initiativePlayer = this.game.playerSystem.player1;
    this._nextInitiativePlayer = this.game.playerSystem.player2;

    this.initiativePlayer.boardSide.leftBattlefield.destinyCard =
      this.initiativePlayer.cardManager.destinyDeck.draw(1)[0] ?? null;
    this.initiativePlayer.opponent.boardSide.rightBattlefield.destinyCard =
      this.initiativePlayer.opponent.cardManager.destinyDeck.draw(1)[0] ?? null;

    if (!this.game.config.DEFINITIVE_PASSES) {
      // Any input that is not exempt resets the consecutive pass counter
      this.game.on(GAME_EVENTS.INPUT_START, event => {
        if (!PASS_RESET_EXEMPT_INPUTS.has(event.data.input.name)) {
          this.consecutivePassCount = 0;
        }
      });
    }
  }

  shutdown() {}

  get initiativePlayer() {
    return this._initiativePlayer;
  }

  get elapsedTurns() {
    return this._elapsedTurns;
  }

  private async rotateDestinyCards() {
    for (const player of this.game.playerSystem.players) {
      const left = player.boardSide.leftBattlefield;
      const right = player.boardSide.rightBattlefield;

      const hasRight = !!right.destinyCard;
      const hasLeft = !!left.destinyCard;
      if (hasRight) {
        const card = right.destinyCard!;
        await right.destinyCard!.removeFromCurrentLocation();
        player.cardManager.destinyDeck.addToBottom(card);
        left.destinyCard = player.cardManager.destinyDeck.draw(1)[0] ?? null;
      }

      if (hasLeft) {
        const card = left.destinyCard!;
        await card!.removeFromCurrentLocation();
        right.destinyCard = card;
      }
    }
  }

  async startTurn() {
    await this.rotateDestinyCards();

    for (const player of this.game.playerSystem.players) {
      await player.startTurn();
    }

    await this.game.emit(
      TURN_EVENTS.TURN_START,
      new TurnEvent({ turnCount: this.elapsedTurns })
    );

    if (this.game.config.DEFINITIVE_PASSES) {
      // The first player to pass last turn gets initiative this turn
      this._initiativePlayer = this.firstPlayerToPassThisRound ?? this._initiativePlayer;
      this.firstPlayerToPassThisRound = null;
    } else {
      // Initiative alternates each turn: player1 on even turns, player2 on odd turns
      this._initiativePlayer = this._nextInitiativePlayer;
      this._nextInitiativePlayer = this._initiativePlayer.opponent;
      this.consecutivePassCount = 0;
    }

    await this.game.emit(
      TURN_EVENTS.TURN_INITATIVE_CHANGE,
      new TurnInitiativeChangeEvent({ newInitiativePlayer: this._initiativePlayer })
    );
  }

  endTurn() {
    this._elapsedTurns++;

    return this.game.emit(
      TURN_EVENTS.TURN_END,
      new TurnEvent({ turnCount: this.elapsedTurns })
    );
  }

  async pass(player: Player) {
    if (!player.equals(this._initiativePlayer)) return;
    await this.game.emit(
      TURN_EVENTS.TURN_PASS,
      new TurnPassEvent({ player: this._initiativePlayer })
    );

    if (this.game.config.DEFINITIVE_PASSES) {
      // A player can only pass once; the first to pass determines next turn's initiative
      player.passTurn();
      if (!this.firstPlayerToPassThisRound) {
        this.firstPlayerToPassThisRound = player;
      }
      const allPlayersPassed = this.game.playerSystem.players.every(
        p => p.hasPassedThisTurn
      );
      if (allPlayersPassed) {
        await this.game.gamePhaseSystem.endTurn();
      } else {
        this._initiativePlayer = this._initiativePlayer.opponent;
        await this.game.emit(
          TURN_EVENTS.TURN_INITATIVE_CHANGE,
          new TurnInitiativeChangeEvent({ newInitiativePlayer: this._initiativePlayer })
        );
      }
    } else {
      // Turn ends only when both players pass consecutively; any other input resets the count
      this.consecutivePassCount++;
      if (this.consecutivePassCount >= 2) {
        this.consecutivePassCount = 0;
        await this.game.gamePhaseSystem.endTurn();
      } else {
        this._initiativePlayer = this._initiativePlayer.opponent;
        await this.game.emit(
          TURN_EVENTS.TURN_INITATIVE_CHANGE,
          new TurnInitiativeChangeEvent({ newInitiativePlayer: this._initiativePlayer })
        );
      }
    }
  }

  async switchInitiative() {
    if (this.game.config.DEFINITIVE_PASSES) {
      // In definitive pass mode, a player who has already passed cannot receive initiative
      if (this._initiativePlayer.opponent.hasPassedThisTurn) return;
    }

    this._initiativePlayer = this._initiativePlayer.opponent;

    await this.game.emit(
      TURN_EVENTS.TURN_INITATIVE_CHANGE,
      new TurnInitiativeChangeEvent({ newInitiativePlayer: this._initiativePlayer })
    );
  }
}

export class TurnEvent extends TypedSerializableEvent<
  { turnCount: number },
  { turnCount: number }
> {
  serialize(): { turnCount: number } {
    return {
      turnCount: this.data.turnCount
    };
  }
}

export class TurnInitiativeChangeEvent extends TypedSerializableEvent<
  { newInitiativePlayer: Player },
  { newInitiativePlayer: string }
> {
  serialize() {
    return {
      newInitiativePlayer: this.data.newInitiativePlayer.id
    };
  }
}

export class TurnPassEvent extends TypedSerializableEvent<
  { player: Player },
  { player: string }
> {
  serialize() {
    return {
      player: this.data.player.id
    };
  }
}
