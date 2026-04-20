import type { GameClient } from '../client';
import type { AbilityViewModel } from '../view-models/ability.model';
import type { CardActionRule, CardViewModel } from '../view-models/card.model';

export class UseAbilityAction implements CardActionRule {
  readonly id = 'use_ability';

  constructor(
    private client: GameClient,
    private ability: AbilityViewModel
  ) {}

  predicate() {
    return this.ability.canUse && this.client.isActive();
  }

  getLabel() {
    const a = this.ability;
    return `${a.manaCost ? ` @[mana] ${a.manaCost}@` : ''}  ${a.label}`;
  }

  handler(card: CardViewModel) {
    this.client.dispatch({
      type: 'useAbility',
      payload: {
        abilityId: this.ability.abilityId,
        cardId: card.id,
        playerId: this.client.playerId
      }
    });
  }
}
