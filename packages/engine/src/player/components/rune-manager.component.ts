import type { BetterExclude } from '@game/shared';
import { AFFINITIES, type Affinity } from '../../card/card.enums';
import type { Game } from '../../game/game';
import type { Player } from '../player.entity';
import { PLAYER_EVENTS } from '../player.enums';
import { PlayerRuneChangeEvent } from '../player.events';

export type AffinityCost = Affinity[];
export type NonNeutralAffinity = BetterExclude<Affinity, 'Neutral'>;

export class RuneManagerComponent {
  private _runes: Record<NonNeutralAffinity, number> = {
    Songhai: 0,
    Abyssian: 0,
    Vetruvian: 0,
    Magmar: 0,
    Lyonar: 0,
    Vanar: 0
  };

  constructor(
    private game: Game,
    private player: Player
  ) {}

  has(cost: AffinityCost) {
    const available = { ...this._runes };
    const nonNeutralCost = cost.filter(rune => rune !== AFFINITIES.NEUTRAL);
    const neutralCost = cost.filter(rune => rune === AFFINITIES.NEUTRAL);

    // try to pay non neutral cost first
    for (const rune of nonNeutralCost) {
      if (available[rune] > 0) {
        available[rune]--;
      } else {
        return false;
      }
    }

    const remaining = Object.values(available).reduce((sum, count) => sum + count, 0);

    return remaining >= neutralCost.length;
  }

  async add(runes: NonNeutralAffinity[]) {
    const gainedRunes: NonNeutralAffinity[] = [];
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

  async remove(runes: NonNeutralAffinity[]) {
    const lostRunes: NonNeutralAffinity[] = [];
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

  get runeCount() {
    return Object.values(this._runes).reduce((sum, count) => sum + count, 0);
  }
}
