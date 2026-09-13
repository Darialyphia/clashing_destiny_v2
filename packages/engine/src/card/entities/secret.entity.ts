import { isDefined } from '@game/shared';
import type { Game } from '../../game/game';
import { GAME_PHASES } from '../../game/game.enums';
import type { Player } from '../../player/player.entity';
import { Interceptable } from '../../utils/interceptable';
import { type SecretBlueprint, type Targets } from '../card-blueprint';
import { CARD_EVENTS, CARD_KINDS, CARD_LOCATIONS } from '../card.enums';
import {
  CardChangeLocationEvent,
  CardEffectTriggeredEvent,
  CardPlayEvent
} from '../card.events';
import {
  Card,
  makeCardInterceptors,
  type CardInterceptors,
  type CardOptions,
  type SerializedCard
} from './card.entity';
import type { DestinyCard } from './destiny.entity';
import { GAME_EVENTS, type GameEventMap } from '../../game/game.events';

export type SerializedSecretCard = SerializedCard;
export type SecretCardInterceptors = CardInterceptors & {
  canPlay: Interceptable<boolean, SecretCard>;
  canBeTargeted: Interceptable<boolean, SecretCard>;
  upfrontCost: Interceptable<number, SecretCard>;
};

export class SecretCard extends Card<
  SerializedSecretCard,
  SecretCardInterceptors,
  SecretBlueprint<any>
> {
  private targets: Targets | null = null;

  constructor(game: Game, player: Player, options: CardOptions<SecretBlueprint<any>>) {
    super(
      game,
      player,
      {
        ...makeCardInterceptors(),
        canPlay: new Interceptable(),
        canBeTargeted: new Interceptable(),
        upfrontCost: new Interceptable()
      },
      options
    );
    this.wrappedHandler = this.wrappedHandler.bind(this);
  }

  get upfrontCost(): number {
    return this.interceptors.upfrontCost.getValue(
      this.game.config.SECRET_UPFRONT_COST,
      this
    );
  }

  override get canPayManaCost() {
    return this.player.mana >= this.upfrontCost;
  }

  override async payManaCost() {
    if (!this.canPayManaCost) return;
    await this.player.manaManager.spend(this.upfrontCost);
  }

  get isCorrectPhaseToPlay() {
    return this.game.gamePhaseSystem.getContext().state === GAME_PHASES.MAIN;
  }

  canPlay() {
    return this.interceptors.canPlay.getValue(
      this.canPlayBase &&
        this.blueprint.canPlay(this.game, this) &&
        this.isCorrectPhaseToPlay,
      this
    );
  }

  private async selectPosition() {
    const result = await this.game.interaction.selectCardsOnBoard<DestinyCard>({
      source: this,
      player: this.player,
      label: 'Select position to play',
      canCancel: true,
      isElligible: card => {
        if (card.kind !== CARD_KINDS.DESTINY) return false;
        const destinyCard = card as DestinyCard;
        if (destinyCard.isAlly(this)) {
          return !isDefined(destinyCard.battlefield!.secretCard);
        } else
          return !isDefined(destinyCard.battlefield!.opponentBattlefield!.secretCard);
      },
      canCommit(selectedSpaces) {
        return selectedSpaces.length === 1;
      },
      isDone(selectedSpaces) {
        return selectedSpaces.length === 1;
      },
      aiHints: {
        shouldPick: () => 1
      },
      timeoutFallback: []
    });

    return result;
  }

  get battlefield() {
    if (this.location === CARD_LOCATIONS.LEFT_BATTLEFIELD) {
      return this.player.boardSide.leftBattlefield;
    }
    if (this.location === CARD_LOCATIONS.RIGHT_BATTLEFIELD) {
      return this.player.boardSide.rightBattlefield;
    }
    return null;
  }

  get isOnBoard() {
    return (
      this.location === CARD_LOCATIONS.LEFT_BATTLEFIELD ||
      this.location === CARD_LOCATIONS.RIGHT_BATTLEFIELD
    );
  }

  private async wrappedHandler(event: GameEventMap[keyof GameEventMap]) {
    if (!this.blueprint.trigger.filter(this.game, this, event)) {
      return;
    }
    const leftoverCost = this.manaCost - this.upfrontCost;
    if (this.player.mana < leftoverCost) return;

    if (leftoverCost > 0) {
      await this.player.manaManager.spend(leftoverCost);
    }

    await this.game.emit(
      CARD_EVENTS.CARD_EFFECT_TRIGGERED,
      new CardEffectTriggeredEvent({
        card: this,
        message: `${this.blueprint.name} was triggered`
      })
    );
    await this.reveal();
    await this.blueprint.onTrigger(this.game, this, event, this.targets!);
    await this.dispose();
  }

  async onLeaveBoard(event: CardChangeLocationEvent) {
    if (!event.data.card.equals(this)) return;
    if (
      this.location !== CARD_LOCATIONS.LEFT_BATTLEFIELD &&
      this.location !== CARD_LOCATIONS.RIGHT_BATTLEFIELD
    ) {
      return;
    }

    this.game.off(this.blueprint.trigger.eventName, this.wrappedHandler as any);
    this.game.off(CARD_EVENTS.CARD_AFTER_CHANGE_LOCATION, this.onLeaveBoard);
  }

  async playWithTargets(position: DestinyCard, targets: Targets) {
    this.targets = targets;
    await this.resolve(async () => {
      await this.removeFromCurrentLocation();
      const battlefield = position.isAlly(this)
        ? position.battlefield!
        : position.battlefield!.opponentBattlefield!;
      battlefield.secretCard = this;
      this.game.on(this.blueprint.trigger.eventName, this.wrappedHandler as any);
      this.game.on(CARD_EVENTS.CARD_AFTER_CHANGE_LOCATION, this.onLeaveBoard);
      this.game.once(GAME_EVENTS.TURN_END, async () => {
        if (this.isOnBoard) {
          await this.addToHand();
        }
      });
    });

    this.targets = null;
  }

  async play() {
    await this.game.emit(
      CARD_EVENTS.CARD_DECLARE_PLAY,
      new CardPlayEvent({ card: this })
    );

    const positionResult = await this.selectPosition();
    if (positionResult.cancelled) {
      return { cancelled: true };
    }
    await this.payManaCost();
    const targetsResult = await this.blueprint.getTargets(this.game, this);
    if (targetsResult.cancelled) {
      return { cancelled: true };
    }
    await this.playWithTargets(positionResult.result[0], targetsResult.result);

    return { cancelled: false };
  }
  serialize(): SerializedSecretCard {
    return {
      ...this.serializeBase()
    };
  }
}
