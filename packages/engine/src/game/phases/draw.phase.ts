import type { EmptyObject, Serializable } from '@game/shared';
import type { Game } from '../game';
import type { GamePhaseController } from './game-phase';
import { GAME_PHASE_TRANSITIONS } from '../game.enums';

export class DrawPhase implements GamePhaseController, Serializable<EmptyObject> {
  constructor(private game: Game) {}

  private async drawForTurn() {
    for (const player of this.game.playerSystem.players) {
      await player.cardManager.draw(player.cardsDrawnForTurn);
    }
    await this.game.gamePhaseSystem.sendTransition(GAME_PHASE_TRANSITIONS.DRAW_FOR_TURN);
  }

  private async recollect() {
    for (const player of this.game.playerSystem.players) {
      const cards = [...player.cardManager.destinyZone];

      for (const card of cards) {
        await card.removeFromCurrentLocation();
        if (card.canBeRecollected) {
          await card.player.cardManager.addToHand(card);
        } else {
          await card.player.cardManager.sendToDiscardPile(card);
        }
      }
    }
  }

  async onEnter() {
    for (const player of this.game.playerSystem.players) {
      await player.startTurn();
    }

    await this.drawForTurn();
    await this.recollect();
  }

  async onExit() {}

  serialize(): EmptyObject {
    return {};
  }
}
