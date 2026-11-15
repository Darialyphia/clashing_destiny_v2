import type { GameClient } from '../client';
import type { GameClientState } from '../controllers/state-controller';
import type { GlobalActionRule } from '../controllers/ui-controller';
import type { PlayerViewModel } from '../view-models/player.model';

export class LevelUpGlobalAction implements GlobalActionRule {
  readonly variant = 'primary' as const;

  readonly id = 'levelUp';

  constructor(private client: GameClient) {}

  private getPlayer(state: GameClientState) {
    return state.entities[this.client.playerId] as PlayerViewModel | undefined;
  }

  getLabel(state: GameClientState): string {
    return `Level up (${this.getPlayer(state)?.expToNextLevel ?? 0} exp)`;
  }

  // only shown while the player has enough experience and hasn't leveled up this turn yet
  shouldDisplay(state: GameClientState): boolean {
    const player = this.getPlayer(state);
    if (!player || player.hasLeveledUpThisTurn) return false;
    if (player.expToNextLevel === null) return false;

    return player.exp >= player.expToNextLevel;
  }

  // the engine decides about the timing (initiative, idle state, no chain or combat)
  shouldBeDisabled(state: GameClientState): boolean {
    return !this.getPlayer(state)?.canLevelUp;
  }

  onClick(): void {
    this.client.levelUp();
  }
}
