import type { Game } from '../game';

export class IdleContext {
  constructor(private game: Game) {}

  get player() {
    return this.game.turnSystem.initiativePlayer;
  }

  serialize() {
    return {
      player: this.player.id
    };
  }

  cancel() {} //noop
}
