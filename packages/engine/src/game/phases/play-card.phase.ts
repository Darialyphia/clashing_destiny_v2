import { assert, type Serializable } from '@game/shared';
import type { Player } from '../../player/player.entity';
import type { Game } from '../game';
import { InvalidPlayerError } from '../game-error';
import type { AnyCard } from '../../card/entities/card.entity';
import type { GamePhaseController } from './game-phase';
import { GAME_PHASE_TRANSITIONS } from '../game.enums';

export class PlayCardPhase
  implements GamePhaseController, Serializable<{ card: string; player: string }>
{
  private _card!: AnyCard;

  private _player!: Player;

  constructor(private game: Game) {}

  async init() {
    this._card.removeFromCurrentLocation();
  }

  onEnter() {
    return Promise.resolve();
  }

  onExit() {
    return Promise.resolve();
  }

  serialize() {
    return {
      card: this._card.id,
      player: this._player.id
    };
  }

  async play(player: Player, card: AnyCard) {
    this._card = card;
    this._player = player;

    await card.removeFromCurrentLocation();
    card.isPlayedFromHand = true;
    await card.play();

    if (card.shouldSwitchInitiativeAfterPlay) {
      await this.game.turnSystem.switchInitiative();
    }

    await this.game.gamePhaseSystem.sendTransition(
      GAME_PHASE_TRANSITIONS.COMMIT_PLAYING_CARD
    );
  }

  async cancel(player: Player) {
    assert(player.equals(this._player), new InvalidPlayerError());
    await this.game.gamePhaseSystem.sendTransition(
      GAME_PHASE_TRANSITIONS.CANCEL_PLAYING_CARD
    );
  }
}
