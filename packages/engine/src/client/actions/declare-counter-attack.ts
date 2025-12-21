import type { GameClient } from '../client';
import type { CardActionRule, CardViewModel } from '../view-models/card.model';

export class DeclareBlockerAction implements CardActionRule {
  readonly id = 'declare_blocker';

  constructor(private client: GameClient) {}

  predicate(card: CardViewModel) {
    return card.canCounterattack && this.client.isActive();
  }

  getLabel() {
    return `Block`;
  }

  handler(card: CardViewModel) {
    this.client.declareBlocker(card.id);
  }
}
