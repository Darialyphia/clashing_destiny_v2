import { isDefined } from '@game/shared';
import type { GameClient } from '../client';
import type { GameClientState } from '../controllers/state-controller';
import type { GlobalActionRule } from '../controllers/ui-controller';
import { INTERACTION_STATES } from '../../game/systems/game-interaction.system';
import { GAME_PHASES } from '../../game/game.enums';

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
    } else {
      return (
        state.phase.state === GAME_PHASES.MAIN &&
        state.interaction.state === INTERACTION_STATES.IDLE &&
        this.client.playerId === state.currentPlayer
      );
    }
  }

  shouldBeDisabled(): boolean {
    return false;
  }

  onClick(): void {
    this.client.pass();
  }
}
