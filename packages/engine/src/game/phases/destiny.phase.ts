import type { Game } from '../game';
import type { GamePhaseController } from './game-phase';
import { GAME_PHASE_TRANSITIONS } from '../systems/game-phase.system';
import type { EmptyObject, Serializable } from '@game/shared';

export class DestinyPhase implements GamePhaseController, Serializable<EmptyObject> {
  constructor(private game: Game) {}

  async unlockTalent(id: string) {
    await this.game.gamePhaseSystem.turnPlayer.hero.talentTree.getNode(id)?.unlock();
    await this.game.gamePhaseSystem.sendTransition(
      GAME_PHASE_TRANSITIONS.GO_TO_MAIN_PHASE
    );
  }

  async skipDestinyPhase() {
    await this.game.gamePhaseSystem.sendTransition(
      GAME_PHASE_TRANSITIONS.GO_TO_MAIN_PHASE
    );
  }

  private async recollectDestinyCards() {
    const cards = [...this.game.gamePhaseSystem.turnPlayer.cardManager.destinyZone];

    for (const card of cards) {
      await card.removeFromCurrentLocation();
      await card.player.cardManager.addToHand(card);
    }
  }

  async onEnter() {}

  async onExit() {
    await this.recollectDestinyCards();
  }

  serialize(): EmptyObject {
    return {};
  }
}
