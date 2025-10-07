import type { Game } from '../game';
import { GAME_EVENTS, GameOverEvent } from '../game.events';
import type { GamePhaseController } from './game-phase';
import type { EmptyObject, Serializable } from '@game/shared';

export class GameEndPhase implements GamePhaseController, Serializable<EmptyObject> {
  constructor(private game: Game) {}

  async onEnter() {
    await this.game.emit(
      GAME_EVENTS.GAME_OVER,
      new GameOverEvent({ winners: this.game.gamePhaseSystem.winners })
    );
  }

  async onExit() {}

  serialize(): EmptyObject {
    return {};
  }
}
