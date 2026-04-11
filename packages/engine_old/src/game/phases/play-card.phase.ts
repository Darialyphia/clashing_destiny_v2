import { CARD_KINDS } from '../../card/card.enums';
import type { AnyCard } from '../../card/entities/card.entity';
import type { DestinyCard } from '../../card/entities/destiny.entity';
import type { Player } from '../../player/player.entity';
import type { Game } from '../game';
import { InvalidPlayerError } from '../game-error';
import { GAME_PHASE_TRANSITIONS } from '../game.enums';

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

    if (this.card.kind === CARD_KINDS.DESTINY) {
      await this.card.player.playDestinyDeckCard(this.card as DestinyCard);
      await this.game.turnSystem.switchInitiative();
      await this.game.gamePhaseSystem.sendTransition(
        GAME_PHASE_TRANSITIONS.COMMIT_PLAYING_CARD
      );
    }

    const result = await this.currentPlayer.playMainDeckCard(this.card);
    if (result.cancelled) return;
    if (this.card.shouldSwitchInitiativeAfterPlay) {
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
