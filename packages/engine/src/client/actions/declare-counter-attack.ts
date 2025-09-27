import type { GameClient } from '../client';
import type { CardActionRule, CardViewModel } from '../view-models/card.model';

export class DeclareCounterAttackAction implements CardActionRule {
  readonly id = 'declare_counter_attack';

  constructor(private client: GameClient) {}

  predicate(card: CardViewModel) {
    return card.canCounterattack;
  }

  getLabel() {
    return `Retaliate`;
  }

  handler(card: CardViewModel) {
    this.client.declareCounterAttack(card.id);
  }
}
