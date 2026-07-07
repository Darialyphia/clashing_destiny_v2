import type { GameClient } from '../client';
import type { CardActionRule, CardViewModel } from '../view-models/card.model';

export class PlayCardAction implements CardActionRule {
  readonly id = 'play';

  constructor(private client: GameClient) {}

  predicate(card: CardViewModel) {
    return card.canPlay && this.client.isActive();
  }

  getLabel(card: CardViewModel) {
    return `@[mana] ${card.manaCost}@ Play`;
  }

  handler(card: CardViewModel) {
    this.client.ui.optimisticState.playedCardId = card.id;

    this.client.dispatch({
      type: 'declarePlayCard',
      payload: {
        id: card.id,
        playerId: this.client.playerId
      }
    });

    void this.client.fxAdapter.onDeclarePlayCard(card, this.client);
  }
}
