import type { Game } from '../game';
import type { GamePhaseController } from './game-phase';
import type { EmptyObject, Serializable } from '@game/shared';

export class MainPhase implements GamePhaseController, Serializable<EmptyObject> {
  constructor(private game: Game) {}

  async startCombat() {
    return this.game.gamePhaseSystem.startCombat();
  }

  async onEnter() {}

  async onExit() {}

  serialize(): EmptyObject {
    return {};
  }
}
