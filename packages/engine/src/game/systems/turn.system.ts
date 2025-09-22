import type { Player } from '../../player/player.entity';
import { TypedSerializableEvent } from '../../utils/typed-emitter';
import { TURN_EVENTS } from '../game.enums';
import { System } from '../../system';
import type { AnyFunction } from '@game/shared';

export type TurnEventMap = {
  [TURN_EVENTS.TURN_START]: TurnEvent;
  [TURN_EVENTS.TURN_END]: TurnEvent;
};

export class TurnSystem extends System<never> {
  private _elapsedTurns = 0;

  // the initiative player is the one that can start an action
  private _initiativePlayer!: Player;

  private nextInitiativePlayer!: Player;

  async initialize() {
    // const idx = this.game.rngSystem.nextInt(this.game.playerSystem.players.length);
    this._initiativePlayer = this.game.playerSystem.player1;
    this.nextInitiativePlayer = this._initiativePlayer.opponent;
  }

  shutdown() {}

  get initiativePlayer() {
    return this._initiativePlayer;
  }

  get elapsedTurns() {
    return this._elapsedTurns;
  }

  startTurn() {
    this._initiativePlayer = this.nextInitiativePlayer;
    this.nextInitiativePlayer = this._initiativePlayer.opponent;

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

  async takeAction(action: AnyFunction) {
    await action();
    this._initiativePlayer = this._initiativePlayer.opponent;
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
