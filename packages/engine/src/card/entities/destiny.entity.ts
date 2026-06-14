import type { Game } from '../../game/game';
import type { Player } from '../../player/player.entity';
import { type DestinyBlueprint } from '../card-blueprint';
import {
  Card,
  makeCardInterceptors,
  type CardInterceptors,
  type CardOptions,
  type SerializedCard
} from './card.entity';

export type SerializedDestinyCard = SerializedCard;
export type DestinyCardInterceptors = CardInterceptors;

export class DestinyCard extends Card<
  SerializedDestinyCard,
  DestinyCardInterceptors,
  DestinyBlueprint
> {
  constructor(game: Game, player: Player, options: CardOptions<DestinyBlueprint>) {
    super(game, player, makeCardInterceptors(), options);
  }

  canPlay(): boolean {
    return true;
  }

  async play() {
    await this.blueprint.onPlay(this.game, this);

    return { cancelled: false };
  }

  serialize(): SerializedDestinyCard {
    return {
      ...this.serializeBase()
    };
  }
}
