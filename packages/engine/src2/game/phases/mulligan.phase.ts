import type { Player } from '../../player/player.entity';
import type { Game } from '../game';
import type { GamePhaseController } from './game-phase';
import { type EmptyObject, type Serializable } from '@game/shared';

export class MulliganPhase implements GamePhaseController, Serializable<EmptyObject> {
  mulliganedIndices = new Map<string, number[]>();

  constructor(private game: Game) {}

  async commitMulliganforPlayer(player: Player, indices: number[]) {
    if (!this.mulliganedIndices.has(player.id)) {
      this.mulliganedIndices.set(player.id, []);
    }
    this.mulliganedIndices.get(player.id)!.push(...indices);

    const isReady = this.game.playerSystem.players.every(p =>
      this.mulliganedIndices.has(p.id)
    );

    if (isReady) {
      await this.game.gamePhaseSystem.commitMulligan();
    }
  }

  async onEnter() {
    if (this.game.config.MAX_MULLIGANED_CARDS === 0) {
      await this.game.gamePhaseSystem.commitMulligan();
    }
  }

  async onExit() {
    for (const player of this.game.playerSystem.players) {
      const indices = this.mulliganedIndices.get(player.id) || [];
      for (const index of indices) {
        const card = player.cardManager.hand[index];
        if (card) {
          player.cardManager.replaceCardAt(index, false);
        }
      }
    }
  }

  serialize(): EmptyObject {
    return {};
  }
}
