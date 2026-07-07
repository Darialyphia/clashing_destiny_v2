import type { GameClient } from '../client';
import type { GameClientState } from '../controllers/state-controller';
import { COMBAT_STEPS, GAME_PHASES, INTERACTION_STATES } from '../../game/game.enums';
import { isDefined } from '@game/shared';
import type { CardActionRule, CardViewModel } from '../view-models/card.model';

export class AttackAction implements CardActionRule {
  id = 'attack';
  constructor(private client: GameClient) {}

  getLabel() {
    return 'Attack';
  }

  predicate(card: CardViewModel, state: GameClientState) {
    console.log();
    return (
      isDefined(this.client.ui.selectedCard) &&
      this.client.ui.selectedCard.canAttackAt(card) &&
      this.client.ui.selectedCard.player.id === this.client.playerId &&
      this.client.ui.isInteractivePlayer &&
      state.phase.state === GAME_PHASES.MAIN &&
      state.interaction.state === INTERACTION_STATES.IDLE &&
      state.combat.step === COMBAT_STEPS.DECLARE_ATTACKER
    );
  }

  handler(card: CardViewModel) {
    if (!card) return;

    this.client.dispatch({
      type: 'declareAttack',
      payload: {
        playerId: this.client.playerId,
        attackerId: this.client.ui.selectedCard!.id,
        targetId: card.id
      }
    });
  }
}
