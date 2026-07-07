import { INTERACTION_STATES } from '../../game/game.enums';
import type { GameClient } from '../client';
import type { GameClientState } from '../controllers/state-controller';
import type { GlobalActionRule } from '../controllers/ui-controller';

export class CommitCardSelectionGlobalAction implements GlobalActionRule {
  readonly variant = 'info' as const;

  readonly id = 'commit-card-selection';

  constructor(private client: GameClient) {}

  getLabel(): string {
    return 'Confirm';
  }

  shouldDisplay(state: GameClientState): boolean {
    return (
      this.client.isActive() &&
      state.interaction.state === INTERACTION_STATES.SELECTING_CARDS_ON_BOARD &&
      state.interaction.ctx.player === this.client.playerId &&
      state.interaction.ctx.canCommit
    );
  }

  shouldBeDisabled(): boolean {
    return false;
  }

  onClick(): void {
    this.client.commitCardSelection();
  }
}
