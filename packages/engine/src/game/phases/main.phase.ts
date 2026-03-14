import type { Player } from '../../player/player.entity';
import type { Game } from '../game';
import { TURN_EVENTS } from '../game.enums';
import { TurnPassEvent } from '../systems/turn.system';
import type { GamePhaseController } from './game-phase';
import type { EmptyObject, Serializable } from '@game/shared';

export class MainPhase implements GamePhaseController, Serializable<EmptyObject> {
  constructor(private game: Game) {}

  private playersWhoHavePassedThisRound: Set<Player> = new Set();

  async onEnter() {}

  async onExit() {}

  async pass(player: Player) {
    if (!player.equals(this.game.turnSystem.initiativePlayer)) return;
    await this.game.emit(
      TURN_EVENTS.TURN_PASS,
      new TurnPassEvent({ player: this.game.turnSystem.initiativePlayer })
    );

    this.playersWhoHavePassedThisRound.add(player);
    const allPlayersPassed =
      this.playersWhoHavePassedThisRound.size === this.game.playerSystem.players.length;

    if (allPlayersPassed) {
      await this.game.gamePhaseSystem.startCombat();
    } else {
      await this.game.turnSystem.switchInitiative();
    }
  }

  serialize(): EmptyObject {
    return {};
  }
}
