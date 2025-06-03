import type { Game } from '../game';

export class IdleContext {
  constructor(private game: Game) {}

  serialize() {
    return {
      player: this.game.gamePhaseSystem.turnPlayer.id
    };
  }
}
