import { CARD_KINDS } from '../../card/card.enums';
import { GAME_PHASES } from '../../game/game.enums';
import type { GameClient } from '../client';
import type { CardActionRule, CardViewModel } from '../view-models/card.model';

export class DrawCardAction implements CardActionRule {
  id = 'draw_card';

  constructor(private client: GameClient) {}

  predicate(card: CardViewModel) {
    return (
      card.kind === CARD_KINDS.HERO &&
      this.client.state.phase.state === GAME_PHASES.MAIN &&
      !this.client.state.effectChain &&
      card.player.canPerformResourceAction &&
      this.client.isActive()
    );
  }

  getLabel() {
    return `Draw Card`;
  }

  handler() {
    this.client.dispatch({
      type: 'commitResourceAction',
      payload: {
        type: 'draw_card',
        playerId: this.client.playerId
      }
    });
  }
}
