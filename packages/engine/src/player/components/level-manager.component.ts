import type { Game } from '../../game/game';
import { GAME_EVENTS } from '../../game/game.events';
import type { Player } from '../player.entity';
import { PlayerGainExpEvent, PlayerLevelUpEvent } from '../player.events';

export class LevelManagerComponent {
  private _level = 1;
  private _exp = 0;

  constructor(
    private game: Game,
    private player: Player
  ) {}

  get level() {
    return this._level;
  }

  get exp() {
    return this._exp;
  }

  async gainExp(amount: number) {
    const config = this.game.config;
    this._exp = Math.min(config.EXP_PER_LEVEL, this._exp + amount);
    await this.game.emit(
      GAME_EVENTS.PLAYER_GAIN_EXP,
      new PlayerGainExpEvent({ player: this.player, amount })
    );
    if (this._exp >= config.EXP_PER_LEVEL) {
      await this.levelUp();
    }
  }

  async levelUp() {
    const config = this.game.config;
    if (this._level >= config.PLAYER_MAX_LEVEL) {
      return;
    }
    if (this._exp < config.EXP_PER_LEVEL) {
      return;
    }
    this._level++;
    this._exp = 0;

    await this.game.emit(
      GAME_EVENTS.PLAYER_LEVEL_UP,
      new PlayerLevelUpEvent({ player: this.player, newLevel: this._level })
    );
  }
}
