import type { Game } from '../../game/game';
import { PLAYER_EVENTS } from '../player.enums';
import type { Player } from '../player.entity';
import { PlayerManaChangeEvent } from '../player.events';
import type { Interceptable } from '../../utils/interceptable';

export type ManaInterceptors = {
  maxMana: Interceptable<number>;
};

export class ManaManagerComponent {
  private _mana = 0;
  private _baseMaxMana = 0;

  constructor(
    private game: Game,
    private player: Player,
    private interceptors: ManaInterceptors
  ) {}

  init() {
    this._baseMaxMana = this.game.config.MAX_MANA;
  }

  get mana() {
    return this._mana;
  }

  get maxMana() {
    return this.interceptors.maxMana.getValue(this._baseMaxMana, {});
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
