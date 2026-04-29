import type { Game } from '../game';

export class IdleContext {
  static async create(game: Game) {
    const instance = new IdleContext(game);
    return instance;
  }
  constructor(private game: Game) {}

  get player() {
    return this.game.interaction.interactivePlayer;
  }

  cancel() {
    return; //noop
  }
  serialize() {
    return {
      player: this.player.id
    };
  }
}
