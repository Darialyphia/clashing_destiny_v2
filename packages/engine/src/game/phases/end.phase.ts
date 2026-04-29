import type { EmptyObject, Serializable } from '@game/shared';
import type { Game } from '../game';
import type { GamePhaseController } from './game-phase';

export class EndPhase implements GamePhaseController, Serializable<EmptyObject> {
  constructor(private game: Game) {}

  async onEnter() {
    await this.game.gamePhaseSystem.endTurn();
  }

  async onExit() {}

  serialize(): EmptyObject {
    return {};
  }
}
