import type { SerializedAbility } from '../../card/card-blueprint';
import type { GameClient } from '../client';
import type { CardActionRule, CardViewModel } from '../view-models/card.model';

export class UseAbilityAction implements CardActionRule {
  readonly id = 'use_ability';

  constructor(
    private client: GameClient,
    private ability: SerializedAbility
  ) {}

  predicate() {
    return this.ability.canUse;
  }

  getLabel() {
    return this.ability.name;
  }

  handler(card: CardViewModel) {
    this.client.adapter.dispatch({
      type: 'useCardAbility',
      payload: {
        abilityId: this.ability.id,
        cardId: card.id,
        playerId: this.client.playerId
      }
    });
  }
}
