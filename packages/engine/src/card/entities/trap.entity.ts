import type { TrapBlueprint } from '../card-blueprint';
import { CARD_EVENTS, CARD_LOCATIONS } from '../card.enums';
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
import type { BoardSpace } from '../../board/board-space.entity';
import { PointAOEShape } from '../../aoe/point.aoe-shape';
import { AOE_TARGETING_TYPE } from '../../aoe/aoe-shape';

// eslint-disable-next-line @typescript-eslint/ban-types
export type SerializedTrapCard = SerializedCard & {
  unplayableReason: string | null;
  manaCost: number;
  baseManaCost: number;
  triggerCost: number;
  baseTriggerCost: number;
};

export type TrapCardInterceptors = CardInterceptors & {
  canPlay: Interceptable<boolean, TrapCard>;
  triggerCost: Interceptable<number, TrapCard>;
};

export class TrapCard extends Card<
  SerializedTrapCard,
  TrapCardInterceptors,
  TrapBlueprint
> {
  constructor(game: Game, player: Player, options: CardOptions<TrapBlueprint>) {
    super(
      game,
      player,
      {
        ...makeCardInterceptors(),
        canPlay: new Interceptable(),
        triggerCost: new Interceptable()
      },
      options
    );
  }

  get triggerCost(): number {
    return this.interceptors.triggerCost.getValue(this.blueprint.triggerCost, this);
  }

  get canAffordTriggerCost(): boolean {
    return this.player.mana >= this.triggerCost;
  }

  canPlay(): boolean {
    return this.interceptors.canPlay.getValue(
      this.canPayManaCost &&
        this.hasUnlockedAffinity &&
        this.blueprint.canPlay(this.game, this),
      this
    );
  }

  get unplayableReason() {
    if (!this.canPayManaCost) {
      return "You don't have enough mana.";
    }

    return this.canPlay() ? null : 'You cannot play this card.';
  }

  removeFromBoard(): Promise<void> {
    return Promise.resolve();
  }

  get potentialPlayPositions() {
    return this.player.boardSide.base.filter(space => space.isEmpty);
  }

  private async selectPosition() {
    const result = await this.game.interaction.selectSpacesOnBoard({
      source: this,
      player: this.player,
      canCancel: true,
      getLabel: () => 'Select position to summon',
      isElligible: space => {
        return this.potentialPlayPositions.includes(space as any);
      },
      canCommit(selectedSpaces) {
        return selectedSpaces.length === 1;
      },
      isDone(selectedSpaces) {
        return selectedSpaces.length === 1;
      },
      timeoutFallback: [this.potentialPlayPositions[0]],
      getAOE: () =>
        new PointAOEShape(this.game, {
          targetingType: AOE_TARGETING_TYPE.EMPTY,
          player: this.player
        })
    });

    return result;
  }

  async playFaceDown() {
    await this.game.emit(
      CARD_EVENTS.CARD_BEFORE_PLAY,
      new CardBeforePlayEvent({ card: this })
    );

    const positionResult = await this.selectPosition();
    if (positionResult.cancelled) {
      return { cancelled: true };
    }

    await this.game.emit(
      CARD_EVENTS.CARD_AFTER_PLAY,
      new CardAfterPlayEvent({ card: this })
    );
  }

  async play() {
    await this.game.emit(
      CARD_EVENTS.CARD_BEFORE_PLAY,
      new CardBeforePlayEvent({ card: this })
    );

    await this.game.emit(
      CARD_EVENTS.CARD_AFTER_PLAY,
      new CardAfterPlayEvent({ card: this })
    );

    return { cancelled: false };
  }

  serialize() {
    return {
      ...this.serializeBase(),
      manaCost: this.manaCost,
      baseManaCost: this.manaCost,
      unplayableReason: this.unplayableReason,
      triggerCost: this.triggerCost,
      baseTriggerCost: this.blueprint.triggerCost
    };
  }
}
