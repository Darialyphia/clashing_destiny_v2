import type { GameClient } from '../client';
import type { CardActionRule, CardViewModel } from '../view-models/card.model';

export class PlayCardAction implements CardActionRule {
  readonly id = 'play';

  constructor(private client: GameClient) {}

  predicate(card: CardViewModel) {
    return card.canPlay;
  }

  getLabel(card: CardViewModel) {
    return `@[mana] ${card.manaCost}@ Play`;
  }

  handler(card: CardViewModel) {
    this.client.networkAdapter.dispatch({
      type: 'declarePlayCard',
      payload: {
        index: card
          .getPlayer()
          .getHand()
          .findIndex(c => c.equals(card)),
        playerId: this.client.playerId
      }
    });
  }
}
