import { assert, type Serializable } from '@game/shared';
import type { Player } from '../../player/player.entity';
import type { Game } from '../game';
import { InvalidPlayerError } from '../game-error';
import type { AnyCard } from '../../card/entities/card.entity';
import type { GamePhaseController } from './game-phase';
import { GAME_PHASE_TRANSITIONS } from '../game.enums';
import { GAME_EVENTS } from '../game.events';

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

    const indexInHand = player.cardManager.hand.findIndex(c => c.equals(card));
    const manaCost = card.manaCost;

    const stop = await this.game.on(GAME_EVENTS.CARD_BEFORE_PLAY, async event => {
      if (event.data.card.equals(card)) {
        await player.manaManager.spend(manaCost);
        stop;
      }
    });

    await card.removeFromCurrentLocation();
    card.isPlayedFromHand = true;

    const result = await card.play();

    if (result.cancelled) {
      await card.addToHand(indexInHand);
      await player.manaManager.gain(manaCost);
      stop();
    } else if (card.shouldSwitchInitiativeAfterPlay) {
      await this.game.turnSystem.switchInitiative();
    }
    card.isPlayedFromHand = false;

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
