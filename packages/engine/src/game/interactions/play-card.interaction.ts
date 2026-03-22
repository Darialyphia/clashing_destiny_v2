import { assert } from '@game/shared';
import type { Player } from '../../player/player.entity';
import type { Game } from '../game';
import { InvalidPlayerError } from '../game-error';
import type { AnyCard } from '../../card/entities/card.entity';
import { match } from 'ts-pattern';
import { CARD_DECK_SOURCES } from '../../card/card.enums';
import { INTERACTION_STATE_TRANSITIONS } from '../game.enums';

type PlayCardContextOptions = {
  card: AnyCard;
  player: Player;
};

export class PlayCardContext {
  static async create(
    game: Game,
    options: PlayCardContextOptions
  ): Promise<PlayCardContext> {
    const instance = new PlayCardContext(game, options);
    await instance.init();
    return instance;
  }

  private _card: AnyCard;
  private cardIndexInHand: number;

  readonly player: Player;

  private constructor(
    private game: Game,
    options: PlayCardContextOptions
  ) {
    this.player = options.player;
    this._card = options.card;
    this.cardIndexInHand = this.player.cardManager.hand.findIndex(c =>
      c.equals(this._card)
    );
  }

  async init() {
    this._card.removeFromCurrentLocation();
  }

  serialize() {
    return {
      card: this._card.id,
      player: this.player.id
    };
  }

  get card() {
    return this._card;
  }

  async commit(player: Player, manaCostIndices: number[] | null) {
    assert(player.equals(this.player), new InvalidPlayerError());
    this.game.interaction.dispatch(INTERACTION_STATE_TRANSITIONS.COMMIT_PLAYING_CARD);
    this.game.interaction.onInteractionEnd();

    await match(this._card.deckSource)
      .with(CARD_DECK_SOURCES.MAIN_DECK, () => {
        const indicesToUse =
          manaCostIndices ??
          Array.from({ length: this._card.manaCost }, (_, index) => index);
        return this.player.playMainDeckCard(this._card, indicesToUse);
      })
      .with(CARD_DECK_SOURCES.DESTINY_DECK, () => {
        this._card.player.hasPlayedDestinyCardThisTurn = true;
        return this.player.playDestinyDeckCard(this._card);
      })
      .exhaustive();
  }

  async cancel(player: Player) {
    assert(player.equals(this.player), new InvalidPlayerError());
    this._card.player.cardManager.addToHand(this._card, this.cardIndexInHand);
    this.game.interaction.dispatch(INTERACTION_STATE_TRANSITIONS.CANCEL_PLAYING_CARD);
    this.game.interaction.onInteractionEnd();
  }
}
