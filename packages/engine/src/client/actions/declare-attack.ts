import { GAME_PHASES } from '../../game/game.enums';
import type { GameClient } from '../client';
import type { CardActionRule, CardViewModel } from '../view-models/card.model';

export class DeclareAttackAction implements CardActionRule {
  readonly id = 'declare_attack';

  constructor(private client: GameClient) {}

  predicate(card: CardViewModel) {
    return (
      this.client.state.phase.state === GAME_PHASES.MAIN &&
      card.canAttack &&
      this.client.isActive()
    );
  }

  getLabel() {
    return `Attack`;
  }

  handler(card: CardViewModel) {
    this.client.dispatch({
      type: 'declareAttack',
      payload: {
        attackerId: card.id,
        playerId: this.client.playerId
      }
    });
  }
}
