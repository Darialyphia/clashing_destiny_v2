import type { Game } from '../../game/game';
import { PLAYER_EVENTS } from '../player.enums';
import type { Player } from '../player.entity';
import { PlayerManaChangeEvent } from '../player.events';
import type { Interceptable } from '../../utils/interceptable';

export type ManaInterceptors = {
  maxMana: Interceptable<number>;
  manaRegen: Interceptable<number>;
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
    this.refillMana();
  }

  get mana() {
    return this._mana;
  }

  get maxMana() {
    return this.interceptors.maxMana.getValue(this._baseMaxMana, {});
  }

  get manaRegen() {
    return this.interceptors.manaRegen.getValue(this.game.config.MANA_REGEN_PER_TURN, {});
  }

  refillMana() {
    this._mana = Math.min(this._mana + this.manaRegen, this.maxMana);
  }

  async spendMana(amount: number) {
    if (amount === 0) return;
    await this.game.emit(
      PLAYER_EVENTS.PLAYER_BEFORE_MANA_CHANGE,
      new PlayerManaChangeEvent({ player: this.player, amount })
    );
    this._mana = Math.max(this._mana - amount, 0);
    await this.game.emit(
      PLAYER_EVENTS.PLAYER_AFTER_MANA_CHANGE,
      new PlayerManaChangeEvent({ player: this.player, amount })
    );
  }

  async gainMana(amount: number) {
    if (amount === 0) return;
    await this.game.emit(
      PLAYER_EVENTS.PLAYER_BEFORE_MANA_CHANGE,
      new PlayerManaChangeEvent({ player: this.player, amount })
    );
    this._mana = this._mana + amount; // dont clamp to max mana because of effects that go over max mana (ex: mana tile)
    await this.game.emit(
      PLAYER_EVENTS.PLAYER_AFTER_MANA_CHANGE,
      new PlayerManaChangeEvent({ player: this.player, amount })
    );
  }

  canSpendMana(amount: number) {
    return this.mana >= amount;
  }
}
