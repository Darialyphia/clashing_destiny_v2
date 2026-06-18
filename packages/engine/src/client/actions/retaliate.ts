import type { GameClient } from '../client';
import type { CardActionRule, CardViewModel } from '../view-models/card.model';

export class DeclareRetaliationAction implements CardActionRule {
  readonly id = 'declare_retaliation';

  constructor(private client: GameClient) {}

  predicate(card: CardViewModel) {
    return card.canRetaliate && this.client.isActive();
  }

  getLabel() {
    return `Retaliate`;
  }

  handler() {
    this.client.declareRetaliation();
  }
}
