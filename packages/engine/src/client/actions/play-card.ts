import type { GameClient } from '../client';
import type { CardActionRule, CardViewModel } from '../view-models/card.model';

export class PlayCardAction implements CardActionRule {
  constructor(private client: GameClient) {}

  predicate(card: CardViewModel) {
    return card.canPlay;
  }

  getLabel(card: CardViewModel) {
    return `@[mana] ${card.manaCost}@ Play`;
  }

  handler(card: CardViewModel) {
    this.client.adapter.dispatch({
      type: 'declarePlayCard',
      payload: {
        index: card.getPlayer().getHand().indexOf(card),
        playerId: this.client.playerId
      }
    });
  }
}
