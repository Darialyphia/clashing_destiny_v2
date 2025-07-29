import type { Game } from '../../game/game';
import type { Player } from '../../player/player.entity';
import { Interceptable } from '../../utils/interceptable';
import { type DestinyBlueprint } from '../card-blueprint';
import { CARD_EVENTS } from '../card.enums';
import { CardAfterPlayEvent, CardBeforePlayEvent } from '../card.events';
import {
  Card,
  makeCardInterceptors,
  type CardInterceptors,
  type CardOptions,
  type SerializedCard
} from './card.entity';

export type SerializedDestinyCard = SerializedCard & {
  minLevel: number;
  destinyCost: number;
};
export type DestinyCardInterceptors = CardInterceptors & {
  canPlay: Interceptable<boolean, DestinyCard>;
};

export class DestinyCard extends Card<
  SerializedCard,
  DestinyCardInterceptors,
  DestinyBlueprint
> {
  constructor(game: Game, player: Player, options: CardOptions<DestinyBlueprint>) {
    super(
      game,
      player,
      {
        ...makeCardInterceptors(),
        canPlay: new Interceptable()
      },
      options
    );
  }

  get minLevel() {
    return this.blueprint.minLevel;
  }

  canPlay() {
    return this.interceptors.canPlay.getValue(
      this.canPayDestinyCost &&
        this.minLevel <= this.player.hero.level &&
        this.interceptors.canPlay.getValue(true, this),
      this
    );
  }

  async play() {
    await this.game.emit(
      CARD_EVENTS.CARD_BEFORE_PLAY,
      new CardBeforePlayEvent({ card: this })
    );
    this.updatePlayedAt();
    this.removeFromCurrentLocation();
    await this.blueprint.onPlay(this.game, this);

    await this.game.emit(
      CARD_EVENTS.CARD_AFTER_PLAY,
      new CardAfterPlayEvent({ card: this })
    );
  }

  serialize(): SerializedDestinyCard {
    return {
      ...this.serializeBase(),
      minLevel: this.minLevel,
      destinyCost: this.destinyCost
    };
  }
}
