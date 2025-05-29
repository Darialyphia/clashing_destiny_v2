import type { EmptyObject, Serializable } from '@game/shared';
import type { Game } from '../game';
import type { GamePhaseController } from './game-phase';

export class EndPhase implements GamePhaseController, Serializable<EmptyObject> {
  constructor(private game: Game) {}

  async onEnter() {
    void this.game.effectChainSystem
      .createChain(this.game.gamePhaseSystem.turnPlayer.opponent)
      .then(() => this.game.gamePhaseSystem.endTurn());
  }

  async onExit() {
    await this.game.gamePhaseSystem.endTurn();
  }

  serialize(): EmptyObject {
    return {};
  }
}
