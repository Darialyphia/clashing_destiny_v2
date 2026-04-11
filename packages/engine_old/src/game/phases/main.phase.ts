import type { Player } from '../../player/player.entity';
import type { Game } from '../game';
import { TURN_EVENTS } from '../game.enums';
import { TurnPassEvent } from '../systems/turn.system';
import type { GamePhaseController } from './game-phase';
import type { EmptyObject, Serializable } from '@game/shared';

export class MainPhase implements GamePhaseController, Serializable<EmptyObject> {
  constructor(private game: Game) {}

  async onEnter() {}

  async onExit() {}

  get allPlayersPassedThisTurn() {
    return this.game.playerSystem.players.every(p => p.hasPassedThisTurn);
  }

  async pass(player: Player) {
    if (!player.equals(this.game.turnSystem.initiativePlayer)) return;
    await this.game.emit(
      TURN_EVENTS.TURN_PASS,
      new TurnPassEvent({ player: this.game.turnSystem.initiativePlayer })
    );

    if (this.allPlayersPassedThisTurn) {
      await this.game.gamePhaseSystem.declareEndTurn();
    } else {
      await this.game.turnSystem.switchInitiative();
    }
  }

  serialize(): EmptyObject {
    return {};
  }
}
