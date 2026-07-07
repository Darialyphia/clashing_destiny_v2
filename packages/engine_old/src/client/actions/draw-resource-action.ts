import { isDefined } from '@game/shared';
import type { GameClient } from '../client';
import type { GameClientState } from '../controllers/state-controller';
import type { GlobalActionRule } from '../controllers/ui-controller';
import { INTERACTION_STATES, GAME_PHASES } from '../../game/game.enums';
import type { PlayerViewModel } from '../view-models/player.model';

export class DrawResourceAction implements GlobalActionRule {
  readonly variant = 'info' as const;

  readonly id = 'drawResource';

  constructor(private client: GameClient) {}

  getLabel(): string {
    return 'Draw Additional Card';
  }

  private get currentPlayer() {
    const state = this.client.stateManager.state;
    return state.entities[state.currentPlayer] as PlayerViewModel;
  }

  shouldDisplay(state: GameClientState): boolean {
    return (
      state.phase.state === GAME_PHASES.MAIN &&
      state.interaction.state === INTERACTION_STATES.IDLE &&
      this.client.playerId === state.currentPlayer &&
      this.currentPlayer.canPerformResourceAction
    );
  }

  shouldBeDisabled(): boolean {
    return false;
  }

  onClick(): void {
    this.client.commitResourceAction({
      type: 'draw'
    });
  }
}
