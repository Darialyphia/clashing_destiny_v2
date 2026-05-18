import type { GameClient } from '../client';
import type { GameClientState } from '../controllers/state-controller';
import { GAME_PHASES, INTERACTION_STATES } from '../../game/game.enums';
import type { BoardCellClickRule } from '../controllers/ui-controller';
import { isDefined } from '@game/shared';
import type { BoardSpaceViewModel } from '../view-models/board-space.model';

export class AttackAction implements BoardCellClickRule {
  constructor(private client: GameClient) {}

  predicate(cell: BoardSpaceViewModel, state: GameClientState) {
    return (
      isDefined(this.client.ui.selectedCard) &&
      this.client.ui.selectedCard.canAttackAt(cell) &&
      this.client.ui.isInteractivePlayer &&
      state.phase.state === GAME_PHASES.MAIN &&
      state.interaction.state === INTERACTION_STATES.IDLE
    );
  }

  handler(space: BoardSpaceViewModel) {
    this.client.dispatch({
      type: 'declareAttack',
      payload: {
        playerId: this.client.playerId,
        attackerId: this.client.ui.selectedCard!.id,
        spaceId: space.id
      }
    });
  }
}
