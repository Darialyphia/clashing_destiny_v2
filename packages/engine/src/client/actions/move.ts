import { GAME_PHASES } from '../../game/game.enums';
import type { GameClient } from '../client';
import type { CardActionRule, CardViewModel } from '../view-models/card.model';

export class MoveAction implements CardActionRule {
  readonly id = 'move';

  constructor(private client: GameClient) {}

  predicate(card: CardViewModel) {
    return (
      this.client.state.phase.state === GAME_PHASES.MAIN &&
      card.canMove &&
      this.client.isActive()
    );
  }

  getLabel() {
    return `Move`;
  }

  handler(card: CardViewModel) {
    this.client.dispatch({
      type: 'move',
      payload: {
        cardId: card.id,
        playerId: this.client.playerId
      }
    });
  }
}
