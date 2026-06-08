import type { Game } from '../../game/game';
import type { Player } from '../player.entity';
import { PLAYER_EVENTS, RUNES, type Rune } from '../player.enums';
import { PlayerRuneChangeEvent } from '../player.events';

export type RuneCost = Partial<Record<Rune, number>>;

export class RuneManagerComponent {
  private _runes: Record<Rune, number> = {
    [RUNES.MIGHT]: 0,
    [RUNES.WISDOM]: 0,
    [RUNES.FOCUS]: 0,
    [RUNES.CHAOS]: 0
  };

  constructor(
    private game: Game,
    private player: Player
  ) {}

  has(cost: RuneCost) {
    return Object.entries(cost).every(([rune, amount]) => {
      return this._runes[rune as Rune] >= (amount ?? 0);
    });
  }

  async addRunes(runes: Rune[]) {
    const gainedRunes: Rune[] = [];
    runes.forEach(rune => {
      this._runes[rune]++;
      gainedRunes.push(rune);
    });
    await this.game.emit(
      PLAYER_EVENTS.PLAYER_AFTER_RUNE_CHANGE,
      new PlayerRuneChangeEvent({
        player: this.player,
        gainedRunes,
        lostRunes: []
      })
    );
  }

  async removeRunes(runes: Rune[]) {
    const lostRunes: Rune[] = [];
    runes.forEach(rune => {
      if (this._runes[rune] > 0) {
        this._runes[rune] = Math.max(0, this._runes[rune] - 1);
        lostRunes.push(rune);
      }
    });
    await this.game.emit(
      PLAYER_EVENTS.PLAYER_AFTER_RUNE_CHANGE,
      new PlayerRuneChangeEvent({
        player: this.player,
        gainedRunes: [],
        lostRunes
      })
    );
  }

  get runes() {
    return { ...this._runes };
  }
}
