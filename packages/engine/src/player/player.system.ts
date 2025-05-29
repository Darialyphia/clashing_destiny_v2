import { System } from '../system';
import { Player, type PlayerOptions } from './player.entity';

export type PlayerSystemOptions = {
  players: Array<PlayerOptions>;
};

export class PlayerSystem extends System<PlayerSystemOptions> {
  private playerMap = new Map<string, Player>();

  async initialize(options: PlayerSystemOptions) {
    options.players.forEach(p => {
      const player = new Player(this.game, p);
      this.playerMap.set(p.id, player);
    });

    await Promise.all([...this.playerMap.values()].map(player => player.init()));
  }

  shutdown() {}

  getPlayerById(id: string) {
    return this.playerMap.get(id);
  }

  get players() {
    return [...this.playerMap.values()];
  }

  get player1() {
    return this.players[0];
  }

  get player2() {
    return this.players[1];
  }
}
