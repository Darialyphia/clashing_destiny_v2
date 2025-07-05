import type { Game } from '../game';
import { GAME_PHASES } from '../game.enums';

export class IdleContext {
  constructor(private game: Game) {}

  get player() {
    const ctx = this.game.gamePhaseSystem.getContext();
    if (ctx.state === GAME_PHASES.MAIN) {
      return ctx.ctx.currentPlayer;
    }

    return this.game.gamePhaseSystem.turnPlayer;
  }

  serialize() {
    return {
      player: this.player.id
    };
  }
}
