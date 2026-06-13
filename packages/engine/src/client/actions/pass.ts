import type { GameClient } from '../client';
import type { GameClientState } from '../controllers/state-controller';
import type { GlobalActionRule } from '../controllers/ui-controller';
import { INTERACTION_STATES, GAME_PHASES } from '../../game/game.enums';
import { isDefined } from '@game/shared';

export class PassGlobalAction implements GlobalActionRule {
  readonly variant = 'error' as const;

  readonly id = 'pass';

  constructor(private client: GameClient) {}

  getLabel(): string {
    return 'Pass';
  }

  shouldDisplay(state: GameClientState): boolean {
    if (isDefined(state.effectChain)) {
      return (
        state.effectChain.player === this.client.playerId &&
        state.interaction.state === INTERACTION_STATES.IDLE
      );
    }

    return (
      state.phase.state === GAME_PHASES.MAIN &&
      state.interaction.state === INTERACTION_STATES.IDLE &&
      this.client.playerId === state.currentPlayer
    );
  }

  shouldBeDisabled(): boolean {
    return false;
  }

  onClick(): void {
    const shouldConfirm = false;
    if (shouldConfirm) {
      this.client.ui.isPassConfirmationModalOpened = true;
    } else {
      this.client.pass();
    }
  }
}
