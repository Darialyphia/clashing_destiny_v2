import type { Game } from '../game';
import type { GamePhaseController } from './game-phase';
import { GAME_PHASE_TRANSITIONS } from '../systems/game-phase.system';
import { assert, isDefined, type EmptyObject, type Serializable } from '@game/shared';
import { CardNotFoundError } from '../../card/card-errors';

export class DestinyPhase implements GamePhaseController, Serializable<EmptyObject> {
  constructor(private game: Game) {}

  async playDestinyCard(index: number) {
    const card =
      this.game.gamePhaseSystem.currentPlayer.cardManager.getDestinyCardAt(index);
    assert(isDefined(card), new CardNotFoundError());

    await this.game.gamePhaseSystem.currentPlayer.playDestinyCard(card);
    await this.game.gamePhaseSystem.sendTransition(
      GAME_PHASE_TRANSITIONS.GO_TO_MAIN_PHASE
    );
  }

  async skipDestinyPhase() {
    await this.game.gamePhaseSystem.sendTransition(
      GAME_PHASE_TRANSITIONS.GO_TO_MAIN_PHASE
    );
  }

  private async recollect() {
    const cards = [...this.game.gamePhaseSystem.currentPlayer.cardManager.destinyZone];

    for (const card of cards) {
      await card.removeFromCurrentLocation();
      await card.player.cardManager.addToHand(card);
    }
  }

  async onEnter() {}

  async onExit() {
    await this.recollect();
  }

  serialize(): EmptyObject {
    return {};
  }
}
