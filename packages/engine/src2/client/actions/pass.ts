import type { GameClient } from '../client';
import type { GameClientState } from '../controllers/state-controller';
import type { GlobalActionRule } from '../controllers/ui-controller';
import { INTERACTION_STATES, GAME_PHASES } from '../../game/game.enums';

export class PassGlobalAction implements GlobalActionRule {
  readonly variant = 'error' as const;

  readonly id = 'pass';

  constructor(private client: GameClient) {}

  getLabel(): string {
    return 'Pass';
  }

  shouldDisplay(): boolean {
    return true;
  }

  shouldBeDisabled(state: GameClientState): boolean {
    return (
      state.phase.state !== GAME_PHASES.MAIN ||
      state.interaction.state !== INTERACTION_STATES.IDLE ||
      this.client.playerId !== state.turnPlayer
    );
  }

  onClick(): void {
    this.client.pass();
  }
}
