import type { DestinyBlueprint } from '../card-blueprint';
import { CARD_EVENTS } from '../card.enums';
import { CardAfterPlayEvent, CardBeforePlayEvent } from '../card.events';
import {
  Card,
  makeCardInterceptors,
  type CardInterceptors,
  type CardOptions,
  type SerializedCard
} from './card.entity';
import type { Game } from '../../game/game';
import type { Player } from '../../player/player.entity';
import { Interceptable } from '../../utils/interceptable';

// eslint-disable-next-line @typescript-eslint/ban-types
export type SerializedDestinyCard = SerializedCard & {
  expCost: number;
  baseExpCost: number;
  unplayableReason: string | null;
};

export type DestinyCardInterceptors = CardInterceptors & {
  canPlay: Interceptable<boolean, DestinyCard>;
  expCost: Interceptable<number, DestinyCard>;
};

export class DestinyCard extends Card<
  SerializedDestinyCard,
  DestinyCardInterceptors,
  DestinyBlueprint
> {
  constructor(game: Game, player: Player, options: CardOptions<DestinyBlueprint>) {
    super(
      game,
      player,
      {
        ...makeCardInterceptors(),
        canPlay: new Interceptable(),
        expCost: new Interceptable()
      },
      options
    );
  }

  get canAfford() {
    return this.player.levelManager.exp >= this.expCost;
  }

  get expCost(): number {
    return this.interceptors.expCost.getValue(this.blueprint.expCost, this);
  }

  canPlay(): boolean {
    return this.interceptors.canPlay.getValue(
      this.canAfford &&
        this.hasUnlockedAffinity &&
        this.blueprint.canPlay(this.game, this),
      this
    );
  }

  get unplayableReason() {
    if (!this.canAfford) {
      return "You don't have enough mana.";
    }

    return this.canPlay() ? null : 'You cannot play this card.';
  }

  removeFromBoard(): Promise<void> {
    return Promise.resolve();
  }

  private async selectTargets() {
    const targetsResult = await this.blueprint.getTargets(this.game, this);
    if (targetsResult.cancelled) {
      return { cancelled: true as const };
    }

    return { cancelled: false as const, targets: targetsResult.result };
  }

  async play() {
    const { targets, cancelled } = await this.selectTargets();

    if (cancelled) return { cancelled: true };

    this.player.cardManager.destinyDeck.pluck(this);

    await this.game.emit(
      CARD_EVENTS.CARD_BEFORE_PLAY,
      new CardBeforePlayEvent({ card: this })
    );

    await this.blueprint.onPlay(this.game, this, targets);

    await this.game.emit(
      CARD_EVENTS.CARD_AFTER_PLAY,
      new CardAfterPlayEvent({ card: this })
    );

    return { cancelled: false };
  }

  serialize() {
    return {
      ...this.serializeBase(),
      unplayableReason: this.unplayableReason,
      expCost: this.expCost,
      baseExpCost: this.blueprint.expCost
    };
  }
}
