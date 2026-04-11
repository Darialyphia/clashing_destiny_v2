import type { GameClient } from '../client';
import type { GameClientState } from '../controllers/state-controller';
import type { BoardCellViewModel } from '../view-models/board-cell.model';
import { GAME_PHASES, INTERACTION_STATES } from '../../game/game.enums';
import { isDefined } from '@game/shared';
import type { BoardCellClickRule } from '../controllers/ui-controller';

export class SelectUnitAction implements BoardCellClickRule {
  constructor(private client: GameClient) {}

  predicate(cell: BoardCellViewModel, state: GameClientState) {
    const unit = cell.unit;
    return (
      this.client.ui.isInteractivePlayer &&
      state.phase.state === GAME_PHASES.MAIN &&
      state.interaction.state === INTERACTION_STATES.IDLE &&
      isDefined(unit) &&
      !unit.isExhausted &&
      this.client.ui.selectedUnit?.id !== unit.id &&
      unit.getPlayer()?.id === this.client.playerId
    );
  }

  handler(cell: BoardCellViewModel) {
    const unit = cell.unit;
    if (!unit) return;

    this.client.ui.selectUnit(unit);
  }
}
