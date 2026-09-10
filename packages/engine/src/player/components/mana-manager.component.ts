import type { Game } from '../../game/game';
import { PLAYER_EVENTS } from '../player.enums';
import type { Player } from '../player.entity';
import { PlayerManaChangeEvent } from '../player.events';
import type { Interceptable } from '../../utils/interceptable';
import { GAME_EVENTS } from '../../game/game.events';
import { GAME_PHASES } from '../../game/game.enums';

export type ManaInterceptors = {
  maxMana: Interceptable<number>;
};

export class ManaManagerComponent {
  private _mana = 0;

  private _maxMana = 0;

  constructor(
    private game: Game,
    private player: Player
  ) {}

  init() {
    this.game.on(GAME_EVENTS.AFTER_CHANGE_PHASE, async event => {
      if (event.data.to.state === GAME_PHASES.MAIN) {
        this._maxMana = this.manaRegen;
      }
    });
  }

  get mana() {
    return this._mana;
  }

  get maxMana() {
    return this._maxMana;
  }

  get manaRegen() {
    return this.player.cardManager.hand
      .map(card => card.manaSupply)
      .reduce((a, b) => a + b, 0);
  }

  async refill() {
    await this.game.emit(
      PLAYER_EVENTS.PLAYER_BEFORE_MANA_CHANGE,
      new PlayerManaChangeEvent({ player: this.player, amount: this.manaRegen })
    );
    this._mana = this.manaRegen;
    await this.game.emit(
      PLAYER_EVENTS.PLAYER_AFTER_MANA_CHANGE,
      new PlayerManaChangeEvent({ player: this.player, amount: this.manaRegen })
    );
  }

  async spend(amount: number) {
    if (amount === 0) return;
    await this.game.emit(
      PLAYER_EVENTS.PLAYER_BEFORE_MANA_CHANGE,
      new PlayerManaChangeEvent({ player: this.player, amount: -amount })
    );
    this._mana = Math.max(this._mana - amount, 0);
    await this.game.emit(
      PLAYER_EVENTS.PLAYER_AFTER_MANA_CHANGE,
      new PlayerManaChangeEvent({ player: this.player, amount: -amount })
    );
  }

  async gain(amount: number) {
    if (amount === 0) return;
    await this.game.emit(
      PLAYER_EVENTS.PLAYER_BEFORE_MANA_CHANGE,
      new PlayerManaChangeEvent({ player: this.player, amount })
    );
    this._mana = Math.min(this._mana + amount, this.maxMana);
    await this.game.emit(
      PLAYER_EVENTS.PLAYER_AFTER_MANA_CHANGE,
      new PlayerManaChangeEvent({ player: this.player, amount })
    );
  }

  canSpendMana(amount: number) {
    return this.mana >= amount;
  }
}
