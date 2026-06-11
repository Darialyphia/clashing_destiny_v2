import type { GameClient } from '../client';
import type { GameClientState } from '../controllers/state-controller';
import { GAME_PHASES, INTERACTION_STATES } from '../../game/game.enums';
import type { BoardCellClickRule } from '../controllers/ui-controller';
import type { BoardSpaceViewModel } from '../view-models/board-space.model';

export class MoveAction implements BoardCellClickRule {
  constructor(private client: GameClient) {}

  canMove(cell: BoardSpaceViewModel) {
    if (!this.client.ui.selectedCard) return false;

    return this.client.ui.selectedCard.canMoveTo(cell);
  }

  predicate(cell: BoardSpaceViewModel, state: GameClientState) {
    return (
      this.client.ui.isInteractivePlayer &&
      state.phase.state === GAME_PHASES.MAIN &&
      state.interaction.state === INTERACTION_STATES.IDLE &&
      !!this.client.ui.selectedCard &&
      this.canMove(cell)
    );
  }

  handler(cell: BoardSpaceViewModel) {
    this.client.dispatch({
      type: 'move',
      payload: {
        playerId: this.client.playerId,
        cardId: this.client.ui.selectedCard!.id,
        index: cell.position.index,
        zone: cell.position.zone
      }
    });
    this.client.ui.unselect();
  }
}
