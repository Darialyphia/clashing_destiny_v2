import type { Game } from '../game';

export class IdleContext {
  constructor(private game: Game) {}

  get player() {
    return this.game.gamePhaseSystem.turnPlayer;
  }
  serialize() {
    return {
      player: this.player.id
    };
  }
}
