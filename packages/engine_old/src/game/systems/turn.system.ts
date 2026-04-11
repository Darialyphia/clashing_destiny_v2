import type { Player } from '../../player/player.entity';
import { TypedSerializableEvent } from '../../utils/typed-emitter';
import { TURN_EVENTS } from '../game.enums';
import { System } from '../../system';

export type TurnEventMap = {
  [TURN_EVENTS.TURN_START]: TurnEvent;
  [TURN_EVENTS.TURN_END]: TurnEvent;
  [TURN_EVENTS.TURN_INITATIVE_CHANGE]: TurnInitiativeChangeEvent;
  [TURN_EVENTS.TURN_PASS]: TurnPassEvent;
};

export class TurnSystem extends System<never> {
  private _elapsedTurns = 0;

  // the initiative player is the one that can takestart an action
  private _initiativePlayer!: Player;

  // the player that started the current turn with the initiative
  private _turnInitiativePlayer!: Player;
  // the player who will start next turn with initiative
  private _nextTurnInitiativePlayer!: Player;

  async initialize() {
    // const idx = this.game.rngSystem.nextInt(this.game.playerSystem.players.length);
    this._initiativePlayer = this.game.playerSystem.player1;
    this._turnInitiativePlayer = this._initiativePlayer;
    this._nextTurnInitiativePlayer = this._initiativePlayer.opponent;
  }

  shutdown() {}

  get initiativePlayer() {
    return this._initiativePlayer;
  }

  get elapsedTurns() {
    return this._elapsedTurns;
  }

  async startTurn() {
    await this.game.emit(
      TURN_EVENTS.TURN_START,
      new TurnEvent({ turnCount: this.elapsedTurns })
    );
    this._initiativePlayer = this._nextTurnInitiativePlayer;
    this._turnInitiativePlayer = this._initiativePlayer;
    this._nextTurnInitiativePlayer = this._initiativePlayer.opponent;
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

  async switchInitiative() {
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
