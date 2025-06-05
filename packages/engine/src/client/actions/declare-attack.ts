import type { GameClient } from '../client';
import type { CardClickRule } from '../controllers/ui-controller';
import type { CardViewModel } from '../view-models/card.model';

export class DeclareAttackCardAction implements CardClickRule {
  constructor(private client: GameClient) {}

  predicate(card: CardViewModel) {
    return (
      this.client.ui.isSelectingAttackTarget &&
      card.getPlayer().id !== this.client.playerId &&
      this.client.ui.isInteractingPlayer
    );
  }

  handler(card: CardViewModel) {
    if (!this.client.ui.selectedCard) {
      throw new Error('No selected card to declare an attack with.');
    }

    this.client.adapter.dispatch({
      type: 'declareAttack',
      payload: {
        attackerId: this.client.ui.selectedCard.id,
        defenderId: card.id,
        playerId: this.client.playerId
      }
    });
  }
}
