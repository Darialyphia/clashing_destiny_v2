import type { EmptyObject, Serializable } from '@game/shared';
import type { Game } from '../game';
import type { GamePhaseController } from './game-phase';

export class EndPhase implements GamePhaseController, Serializable<EmptyObject> {
  constructor(private game: Game) {}

  async onEnter() {
    const promise = this.game.effectChainSystem.createChain(
      this.game.interaction.interactivePlayer
    );
    this.game.effectChainSystem.pass(this.game.interaction.interactivePlayer);
    await this.game.inputSystem.askForPlayerInput();
    void promise.then(() => this.game.gamePhaseSystem.endTurn());
  }

  async onExit() {}

  serialize(): EmptyObject {
    return {};
  }
}
