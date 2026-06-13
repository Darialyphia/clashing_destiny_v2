import type { GameClient } from '../client';
import type { GameClientState } from '../controllers/state-controller';
import { GAME_PHASES, INTERACTION_STATES } from '../../game/game.enums';
import { isDefined } from '@game/shared';
import type { CardActionRule, CardViewModel } from '../view-models/card.model';

export class AttackAction implements CardActionRule {
  id = 'attack';
  constructor(private client: GameClient) {}

  getLabel() {
    return 'Attack';
  }

  predicate(card: CardViewModel, state: GameClientState) {
    return (
      isDefined(this.client.ui.selectedCard) &&
      this.client.ui.selectedCard.canAttackAt(card) &&
      this.client.ui.isInteractivePlayer &&
      state.phase.state === GAME_PHASES.MAIN &&
      state.interaction.state === INTERACTION_STATES.IDLE
    );
  }

  handler(card: CardViewModel) {
    if (!card) return;

    this.client.dispatch({
      type: 'declareAttack',
      payload: {
        playerId: this.client.playerId,
        attackerId: this.client.ui.selectedCard!.id,
        targetId: card.id
      }
    });
  }
}
