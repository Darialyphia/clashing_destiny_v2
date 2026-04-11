import { RUNES, type Rune } from '../../card/card.enums';
import type { Game } from '../../game/game';
import type { Player } from '../player.entity';
import { PLAYER_EVENTS } from '../player.enums';
import { PlayerGainRuneEvent, PlayerLoseRuneEvent } from '../player.events';

export class RuneManagerComponent {
  private _runes = {
    [RUNES.RED]: 0,
    [RUNES.BLUE]: 0,
    [RUNES.YELLOW]: 0
  };

  constructor(
    private game: Game,
    private player: Player
  ) {}

  get runes() {
    return { ...this._runes };
  }

  async gainRune(rune: Partial<Record<Rune, number>>) {
    await this.game.emit(
      PLAYER_EVENTS.PLAYER_BEFORE_GAIN_RUNE,
      new PlayerGainRuneEvent({
        player: this.player,
        runes: rune
      })
    );
    for (const [runeType, amount] of Object.entries(rune)) {
      this._runes[runeType as Rune] += amount!;
    }
    await this.game.emit(
      PLAYER_EVENTS.PLAYER_AFTER_GAIN_RUNE,
      new PlayerGainRuneEvent({
        player: this.player,
        runes: rune
      })
    );
  }

  async loseRune(rune: Partial<Record<Rune, number>>) {
    await this.game.emit(
      PLAYER_EVENTS.PLAYER_BEFORE_LOSE_RUNE,
      new PlayerLoseRuneEvent({
        player: this.player,
        runes: rune
      })
    );
    for (const [runeType, amount] of Object.entries(rune)) {
      this._runes[runeType as Rune] -= amount!;
    }
    await this.game.emit(
      PLAYER_EVENTS.PLAYER_AFTER_LOSE_RUNE,
      new PlayerLoseRuneEvent({
        player: this.player,
        runes: rune
      })
    );
  }
}
