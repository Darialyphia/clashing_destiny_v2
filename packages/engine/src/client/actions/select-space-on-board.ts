import type { GameClient } from '../client';
import type { GameClientState } from '../controllers/state-controller';
import { GAME_PHASES, INTERACTION_STATES } from '../../game/game.enums';
import type { BoardCellClickRule } from '../controllers/ui-controller';
import type { BoardSpaceViewModel } from '../view-models/board-space.model';

export class SelectSpaceOnBoardAction implements BoardCellClickRule {
  constructor(private client: GameClient) {}

  predicate(cell: BoardSpaceViewModel, state: GameClientState) {
    return (
      state.interaction.state === INTERACTION_STATES.SELECTING_SPACE_ON_BOARD &&
      state.interaction.ctx.elligibleSpaces.some(space => space.id === cell.id) &&
      this.client.ui.isInteractivePlayer
    );
  }

  handler(cell: BoardSpaceViewModel) {
    this.client.ui.stopDraggingCard();
    this.client.dispatch({
      type: 'selectSpaceOnBoard',
      payload: {
        playerId: this.client.playerId,
        id: cell.id
      }
    });
    if (this.client.state.phase.state === GAME_PHASES.PLAY_CARD) {
      this.client.ui.unselect();
    }
  }
}
