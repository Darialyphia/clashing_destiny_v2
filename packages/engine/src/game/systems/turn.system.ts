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

  // the initiative player is the one that can start an action
  private _initiativePlayer!: Player;

  private nextInitiativePlayer!: Player;

  private consecutivePasses = 0;

  async initialize() {
    // const idx = this.game.rngSystem.nextInt(this.game.playerSystem.players.length);
    this._initiativePlayer = this.game.playerSystem.player1;
    this.nextInitiativePlayer = this._initiativePlayer.opponent;
  }

  shutdown() {}

  private get passesNeededToResolve() {
    // return this.effectStack.length <= 1 ? 1 : 2;
    return 2;
  }

  get initiativePlayer() {
    return this._initiativePlayer;
  }

  get elapsedTurns() {
    return this._elapsedTurns;
  }

  async pass(player: Player) {
    if (!player.equals(this._initiativePlayer)) return;
    await this.game.emit(
      TURN_EVENTS.TURN_PASS,
      new TurnPassEvent({ player: this._initiativePlayer })
    );
    this.consecutivePasses++;
    if (this.consecutivePasses === this.passesNeededToResolve) {
      await this.game.gamePhaseSystem.declareEndTurn();
    } else {
      this._initiativePlayer = this._initiativePlayer.opponent;
      await this.game.emit(
        TURN_EVENTS.TURN_INITATIVE_CHANGE,
        new TurnInitiativeChangeEvent({ newInitiativePlayer: this._initiativePlayer })
      );
    }
  }

  startTurn() {
    this._initiativePlayer = this.nextInitiativePlayer;
    this.nextInitiativePlayer = this._initiativePlayer.opponent;
    this.consecutivePasses = 0;
    return this.game.emit(
      TURN_EVENTS.TURN_START,
      new TurnEvent({ turnCount: this.elapsedTurns })
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
    this.consecutivePasses = 0;
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
