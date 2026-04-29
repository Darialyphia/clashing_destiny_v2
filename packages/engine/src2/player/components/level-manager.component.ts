import type { DestinyCard } from '../../card/entities/destiny-card.entity';
import type { Game } from '../../game/game';
import { GAME_EVENTS } from '../../game/game.events';
import type { Player } from '../player.entity';
import { PlayerGainExpEvent, PlayerLevelUpEvent } from '../player.events';

export class LevelManagerComponent {
  private _exp = 0;

  private _destinies: DestinyCard[] = [];

  private _hasLeveledUpThisTurn = false;

  constructor(
    private game: Game,
    private player: Player
  ) {
    this.game.on(GAME_EVENTS.TURN_START, async () => {
      this._hasLeveledUpThisTurn = false;
    });
  }

  get exp() {
    return this._exp;
  }

  get destinies() {
    return [...this._destinies];
  }

  get level() {
    return this.destinies.length;
  }

  get talents() {
    return this.destinies;
  }

  async gainExp(amount: number) {
    this._exp = Math.min(this._exp + amount, this.game.config.MAX_HELD_EXP);
    await this.game.emit(
      GAME_EVENTS.PLAYER_GAIN_EXP,
      new PlayerGainExpEvent({ player: this.player, amount })
    );
  }

  get canLevelup() {
    return (
      !this._hasLeveledUpThisTurn &&
      this.destinies.length < this.game.config.PLAYER_MAX_LEVEL
    );
  }

  async levelUp(destiny: DestinyCard) {
    await destiny.play(() => {});
    this._exp -= destiny.expCost;
    this._destinies.push(destiny);

    await this.game.emit(
      GAME_EVENTS.PLAYER_LEVEL_UP,
      new PlayerLevelUpEvent({ player: this.player, newLevel: this.level })
    );
  }
}
