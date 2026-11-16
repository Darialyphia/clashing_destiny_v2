import { assert } from '@game/shared';
import type { Game } from '../../game/game';
import { COMBAT_STEPS, GAME_PHASES, INTERACTION_STATES } from '../../game/game.enums';
import { CannotLevelUpError } from '../../input/input-errors';
import type { Player } from '../player.entity';
import { PLAYER_EVENTS } from '../player.enums';
import { PlayerGainExpEvent, PlayerLevelUpEvent } from '../player.events';

export class LevelManagerComponent {
  private _level: number;

  private _exp = 0;

  private _hasLeveledUpThisTurn = false;

  constructor(
    private game: Game,
    private player: Player
  ) {
    this._level = this.game.config.STARTING_PLAYER_LEVEL;
  }

  get level() {
    return this._level;
  }

  get exp() {
    return this._exp;
  }

  get hasLeveledUpThisTurn() {
    return this._hasLeveledUpThisTurn;
  }

  get isMaxLevel() {
    return this._level >= this.game.config.MAX_PLAYER_LEVEL;
  }

  // experience that will be spent to reach the next level, null at max level
  get expToNextLevel(): number | null {
    if (this.isMaxLevel) return null;
    return this.game.config.EXP_TO_REACH_LEVEL[this._level + 1] ?? null;
  }

  get hasEnoughExpToLevelUp() {
    const cost = this.expToNextLevel;
    return cost !== null && this._exp >= cost;
  }

  // leveling up is a free action: it can be done once per turn,
  // in the main phase, while having initiative and nothing else is going on
  get canLevelUp() {
    return (
      !this._hasLeveledUpThisTurn &&
      this.hasEnoughExpToLevelUp &&
      this.player.hasInitiative &&
      this.game.gamePhaseSystem.getState() === GAME_PHASES.MAIN &&
      this.game.interaction.getState() === INTERACTION_STATES.IDLE &&
      !this.game.effectChainSystem.currentChain &&
      this.game.combatSystem.state === COMBAT_STEPS.DECLARE_ATTACKER
    );
  }

  onTurnStart() {
    this._hasLeveledUpThisTurn = false;
  }

  async gainExp(amount: number) {
    if (amount <= 0) return;

    await this.game.emit(
      PLAYER_EVENTS.PLAYER_BEFORE_GAIN_EXP,
      new PlayerGainExpEvent({ player: this.player, amount, total: this._exp })
    );
    this._exp += amount;
    await this.game.emit(
      PLAYER_EVENTS.PLAYER_AFTER_GAIN_EXP,
      new PlayerGainExpEvent({ player: this.player, amount, total: this._exp })
    );
  }

  async levelUp() {
    const cost = this.expToNextLevel!;
    const event = new PlayerLevelUpEvent({
      player: this.player,
      previousLevel: this._level,
      newLevel: this._level + 1
    });

    await this.game.emit(PLAYER_EVENTS.PLAYER_BEFORE_LEVEL_UP, event);
    this._exp -= cost;
    this._level++;
    this._hasLeveledUpThisTurn = true;
    await this.game.emit(PLAYER_EVENTS.PLAYER_AFTER_LEVEL_UP, event);
  }
}
