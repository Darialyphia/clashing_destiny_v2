import type { MainDeckCard } from '../../board/board.system';
import type { Player } from '../../player/player.entity';
import type { Game } from '../game';
import { GameError } from '../game-error';
import { INTERACTION_STATES } from '../systems/game-interaction.system';
import type { GamePhaseController } from './game-phase';
import { assert, type EmptyObject, type Serializable } from '@game/shared';

export class MainPhase implements GamePhaseController, Serializable<EmptyObject> {
  currentPlayer: Player;

  consecutivePasses = 0;

  constructor(private game: Game) {
    this.currentPlayer = game.gamePhaseSystem.turnPlayer;
  }

  async playCard(card: MainDeckCard, manacostIndices: number[]) {
    assert(card.player.equals(this.currentPlayer), new GameError('InvalidPlayerError'));
    const ctx = this.game.interaction.getContext();
    assert(
      ctx.state === INTERACTION_STATES.PLAYING_CARD,
      new GameError('InvalidInteractionStateError')
    );

    this.consecutivePasses = 0;
    await ctx.ctx.commit(this.currentPlayer, manacostIndices);
    this.currentPlayer = this.currentPlayer.opponent;
  }

  async pass() {
    this.consecutivePasses++;
    if (this.consecutivePasses >= 2) {
      await this.startCombat();
    }
  }

  async startCombat() {
    return this.game.gamePhaseSystem.startCombat();
  }

  async onEnter() {}

  async onExit() {}

  serialize(): EmptyObject {
    return {};
  }
}
