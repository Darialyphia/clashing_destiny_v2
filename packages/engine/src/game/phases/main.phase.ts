import type { Player } from '../../player/player.entity';
import type { Game } from '../game';
import type { GamePhaseController } from './game-phase';
import { type EmptyObject, type Serializable } from '@game/shared';

export class MainPhase implements GamePhaseController, Serializable<EmptyObject> {
  currentPlayer: Player;

  constructor(private game: Game) {
    this.currentPlayer = game.turnSystem.initiativePlayer;
  }

  async onEnter() {}

  async onExit() {}

  serialize(): EmptyObject {
    return {};
  }
}
