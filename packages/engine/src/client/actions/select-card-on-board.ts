import { isDefined } from '@game/shared';
import { INTERACTION_STATES } from '../../game/game.enums';
import type { GameClient } from '../client';
import type { GameClientState } from '../controllers/state-controller';
import type { CardActionRule, CardViewModel } from '../view-models/card.model';

export class SelectCardOnBoardAction implements CardActionRule {
  id = 'selectCardOnBoard';

  constructor(private client: GameClient) {}

  getLabel() {
    return 'Select Card';
  }

  predicate(card: CardViewModel, state: GameClientState) {
    return (
      this.client.isActive() &&
      state.interaction.state === INTERACTION_STATES.SELECTING_CARDS_ON_BOARD &&
      state.interaction.ctx.elligibleCards.includes(card.id) &&
      this.client.playerId === this.client.getActivePlayerId()
    );
  }

  handler(card: CardViewModel) {
    if (!isDefined(card)) return;
    this.client.dispatch({
      type: 'selectCardOnBoard',
      payload: {
        cardId: card.id,
        playerId: this.client.playerId
      }
    });
  }
}
