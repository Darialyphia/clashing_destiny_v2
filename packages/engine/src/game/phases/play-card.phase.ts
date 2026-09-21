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

  private _isPlayingCard = false;

  private indexInHand = -1;

  private manaCost = 0;

  constructor(private game: Game) {}

  async init() {}

  onEnter() {
    return Promise.resolve();
  }

  onExit() {
    return Promise.resolve();
  }

  get card() {
    return this._card;
  }

  get isPlayingCard() {
    return this._isPlayingCard;
  }

  serialize() {
    return {
      card: this._card.id,
      player: this._player.id,
      isPlayingCard: this._isPlayingCard,
      canPlay: this._card.canPlay()
    };
  }

  async play(player: Player, card: AnyCard) {
    this._card = card;
    this._player = player;

    this.indexInHand = player.cardManager.hand.findIndex(c => c.equals(card));
    this.manaCost = card.manaCost;
    if (this._card.canPlay()) {
      await this.playCard();
    } else {
      console.log(this._card.unplayableReason);
      await card.removeFromCurrentLocation();
    }
  }

  private async playCard() {
    this._isPlayingCard = true;
    await this.card.removeFromCurrentLocation();
    this.card.isPlayedFromHand = true;

    const result = await this.card.play();

    if (result.cancelled) {
      return await this.onCancelDuringPlay();
    } else if (this.card.shouldSwitchInitiativeAfterPlay) {
      await this.game.turnSystem.switchInitiative();
    }

    this._isPlayingCard = false;
    this.card.isPlayedFromHand = false;
    await this.game.gamePhaseSystem.sendTransition(
      GAME_PHASE_TRANSITIONS.COMMIT_PLAYING_CARD
    );
  }

  async supply() {
    await this._player.supplyCard(this._card);

    if (this.isPlayingCard) {
      const interactionContext = this.game.interaction.getContext();
      await interactionContext.ctx.cancel(this._player);
    }

    await this.game.gamePhaseSystem.sendTransition(
      GAME_PHASE_TRANSITIONS.CANCEL_PLAYING_CARD
    );
  }

  private async onCancelDuringPlay() {
    this._isPlayingCard = false;
    await this._player.manaManager.gain(this.manaCost);
    this.card.isPlayedFromHand = false;
    return this.cancel(this._player);
  }

  async cancel(player: Player) {
    await this.card.addToHand(this.indexInHand);
    assert(player.equals(this._player), new InvalidPlayerError());
    await this.game.gamePhaseSystem.sendTransition(
      GAME_PHASE_TRANSITIONS.CANCEL_PLAYING_CARD
    );
  }
}
