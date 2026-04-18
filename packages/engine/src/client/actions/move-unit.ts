import type { GameClient } from '../client';
import type { GameClientState } from '../controllers/state-controller';
import type { BoardCellViewModel } from '../view-models/board-cell.model';
import { GAME_PHASES, INTERACTION_STATES } from '../../game/game.enums';
import type { BoardCellClickRule } from '../controllers/ui-controller';
export class MoveUnitAction implements BoardCellClickRule {
  constructor(private client: GameClient) {}

  canMove(cell: BoardCellViewModel) {
    if (!this.client.ui.selectedUnit) return false;

    return this.client.ui.selectedUnit.canMoveTo(cell);
  }

  predicate(cell: BoardCellViewModel, state: GameClientState) {
    return (
      this.client.ui.isInteractivePlayer &&
      state.phase.state === GAME_PHASES.MAIN &&
      state.interaction.state === INTERACTION_STATES.IDLE &&
      !!this.client.ui.selectedUnit &&
      this.canMove(cell)
    );
  }

  handler(cell: BoardCellViewModel) {
    this.client.dispatch({
      type: 'move',
      payload: {
        playerId: this.client.playerId,
        unitId: this.client.ui.selectedUnit!.id,
        x: cell.x,
        y: cell.y
      }
    });
    this.client.ui.unselectUnit();
  }
}
