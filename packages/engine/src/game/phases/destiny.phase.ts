import type { Game } from '../game';
import type { GamePhaseController } from './game-phase';
import { GAME_PHASE_TRANSITIONS } from '../systems/game-phase.system';
import type { EmptyObject, Serializable } from '@game/shared';

export class DestinyPhase implements GamePhaseController, Serializable<EmptyObject> {
  constructor(private game: Game) {}

  async playDestinyCard(index: number) {
    await this.game.gamePhaseSystem.turnPlayer.playDestinyDeckCardAtIndex(index);
    await this.game.gamePhaseSystem.sendTransition(
      GAME_PHASE_TRANSITIONS.GO_TO_MAIN_PHASE
    );
  }

  private async recollectDestinyCards() {
    const cards = [...this.game.gamePhaseSystem.turnPlayer.cardManager.destinyZone];

    for (const card of cards) {
      await card.addToHand();
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
