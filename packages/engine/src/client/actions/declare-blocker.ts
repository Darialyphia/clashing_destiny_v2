import { COMBAT_STEPS, GAME_PHASES } from '../../game/game.enums';
import type { GameClient } from '../client';
import type { CardActionRule, CardViewModel } from '../view-models/card.model';

export class DeclareBlockerAction implements CardActionRule {
  readonly id = 'declare_attack';

  constructor(private client: GameClient) {}

  predicate(card: CardViewModel) {
    return (
      this.client.state.phase.state === GAME_PHASES.ATTACK &&
      this.client.state.phase.ctx.step === COMBAT_STEPS.BUILDING_CHAIN &&
      card.canBlock &&
      this.client.isActive()
    );
  }

  getLabel() {
    return `Block`;
  }

  handler(card: CardViewModel) {
    this.client.dispatch({
      type: 'declareBlocker',
      payload: {
        blockerId: card.id,
        playerId: this.client.playerId
      }
    });
  }
}
