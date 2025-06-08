import type { Modifier } from '../modifier.entity';
import { ModifierMixin } from '../modifier-mixin';
import { CARD_EVENTS } from '../../card/card.enums';
import type { Game } from '../../game/game';
import type { MinionCard, MinionSummonedEvent } from '../../card/entities/minion.card';
import type {
  ArtifactCard,
  ArtifactEquipedEvent
} from '../../card/entities/artifact.entity';
import type { LocationCard } from '../../card/entities/location.entity';
import type { CardAfterPlayEvent, CardBeforePlayEvent } from '../../card/card.events';
import { GAME_EVENTS } from '../../game/game.events';
import { isArtifact, isLocation, isMinion } from '../../card/card-utils';
import type { MaybePromise } from '@game/shared';

export type OnEnterHandler<T extends MinionCard | ArtifactCard | LocationCard> = (
  event: T extends MinionCard
    ? MinionSummonedEvent
    : T extends ArtifactCard
      ? ArtifactEquipedEvent
      : T extends LocationCard
        ? CardAfterPlayEvent
        : never
) => MaybePromise<void>;

export class OnEnterModifierMixin<
  T extends MinionCard | ArtifactCard | LocationCard
> extends ModifierMixin<T> {
  private modifier!: Modifier<T>;
  constructor(
    game: Game,
    private handler: OnEnterHandler<T>
  ) {
    super(game);
    this.onBeforePlay = this.onBeforePlay.bind(this);
  }

  onBeforePlay(event: CardBeforePlayEvent) {
    if (!event.data.card.equals(this.modifier.target)) {
      return;
    }

    const target = this.modifier.target;
    if (isMinion(target)) {
      const unsub = this.game.on(GAME_EVENTS.MINION_SUMMONED, async event => {
        if (event.data.card.equals(target)) {
          unsub();
          await this.handler(event as any);
        }
      });
    } else if (isArtifact(target)) {
      const unsub = this.game.on(GAME_EVENTS.ARTIFACT_EQUIPED, async event => {
        if (event.data.card.equals(target)) {
          unsub();
          await this.handler(event as any);
        }
      });
    } else if (isLocation(target)) {
      const unsub = this.game.on(GAME_EVENTS.CARD_AFTER_PLAY, async event => {
        if (event.data.card.equals(target)) {
          unsub();
          await this.handler(event as any);
        }
      });
    }
  }

  onApplied(card: T, modifier: Modifier<T>): void {
    this.modifier = modifier;
    this.game.on(CARD_EVENTS.CARD_BEFORE_PLAY, this.onBeforePlay);
  }

  onRemoved(): void {
    this.game.off(CARD_EVENTS.CARD_BEFORE_PLAY, this.onBeforePlay);
  }

  onReapplied(): void {}
}
