import type { Game } from '../game';

export class IdleContext {
  static async create(game: Game) {
    const instance = new IdleContext(game);
    return instance;
  }
  constructor(private game: Game) {}

  get players() {
    return [this.game.turnSystem.initiativePlayer];
  }

  cancel() {
    return; //noop
  }
  serialize() {
    return {
      players: this.players.map(p => p.id),
      canCancel: false
    };
  }
}
