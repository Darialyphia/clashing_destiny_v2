import type { EmptyObject, Serializable } from '@game/shared';
import type { Game } from '../game';
import type { GamePhaseController } from './game-phase';
import { GAME_PHASE_TRANSITIONS } from '../game.enums';

export class SupplyPhase implements GamePhaseController, Serializable<EmptyObject> {
  constructor(private game: Game) {}

  private async emptyMana() {
    for (const player of this.game.playerSystem.players) {
      await player.manaManager.empty();
    }
  }

  async onEnter() {
    // await this.refillMana();
    await this.emptyMana();

    await this.game.gamePhaseSystem.sendTransition(GAME_PHASE_TRANSITIONS.SUPPLIED_MANA);
    await this.game.snapshotSystem.takeSnapshot();
  }

  async onExit() {}

  serialize(): EmptyObject {
    return {};
  }
}
