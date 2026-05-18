import { isDefined } from '@game/shared';
import { INTERACTION_STATES } from '../../game/game.enums';
import type { GameClient } from '../client';
import type { GameClientState } from '../controllers/state-controller';
import type { BoardCellClickRule } from '../controllers/ui-controller';
import type { BoardSpaceViewModel } from '../view-models/board-space.model';

export class SelectCardOnBoardAction implements BoardCellClickRule {
  constructor(private client: GameClient) {}

  predicate(cell: BoardSpaceViewModel, state: GameClientState) {
    return (
      this.client.isActive() &&
      isDefined(cell.occupant) &&
      state.interaction.state === INTERACTION_STATES.SELECTING_CARDS_ON_BOARD &&
      state.interaction.ctx.elligibleCards.includes(cell.occupant.id) &&
      this.client.playerId === this.client.getActivePlayerId()
    );
  }

  handler(cell: BoardSpaceViewModel) {
    if (!isDefined(cell.occupant)) return;
    this.client.dispatch({
      type: 'selectCardOnBoard',
      payload: {
        cardId: cell.occupant.id,
        playerId: this.client.playerId
      }
    });
  }
}
