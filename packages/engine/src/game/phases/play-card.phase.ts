import type { DeckCard } from '../../card/components/card-manager.component';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Player } from '../../player/player.entity';
import type { Game } from '../game';
import { InvalidPlayerError } from '../game-error';
import { GAME_PHASE_TRANSITIONS } from '../systems/game-phase.system';
import type { GamePhaseController } from './game-phase';
import { assert, type Serializable } from '@game/shared';

export class PlayCardPhase
  implements GamePhaseController, Serializable<{ card: string; canCancel: boolean }>
{
  currentPlayer: Player;

  card!: AnyCard;

  private canCancel = true;

  constructor(private game: Game) {
    this.currentPlayer = game.turnSystem.initiativePlayer;
  }

  async onEnter() {}

  async onExit() {}

  async play(card: AnyCard) {
    this.card = card;

    const result = await this.currentPlayer.playCardFromHand(this.card as DeckCard);
    if (result.cancelled) return;
    if (this.card.shouldPassInitiativeAfterPlay) {
      await this.game.turnSystem.switchInitiative();
    }
    await this.game.gamePhaseSystem.sendTransition(
      GAME_PHASE_TRANSITIONS.COMMIT_PLAYING_CARD
    );
  }

  async cancel(player: Player) {
    assert(player.equals(this.currentPlayer), new InvalidPlayerError());
    await this.card.cancelPlay?.();
    await this.game.gamePhaseSystem.sendTransition(
      GAME_PHASE_TRANSITIONS.CANCEL_PLAYING_CARD
    );
  }

  closeCancelWindow() {
    this.canCancel = false;
  }

  serialize(): { card: string; canCancel: boolean } {
    return {
      card: this.card.id,
      canCancel: this.canCancel
    };
  }
}
