import type { Modifier } from '../modifier.entity';
import { ModifierMixin } from '../modifier-mixin';
import { CARD_EVENTS } from '../../card/card.enums';
import type { Game } from '../../game/game';

import type { CardBeforePlayEvent } from '../../card/card.events';
import { GAME_EVENTS } from '../../game/game.events';
import type { MaybePromise } from '@game/shared';
import type { MinionCard } from '../../card/entities/minion.entity';
import type { MinionSummonedEvent } from '../../card/events/minion.events';

export type OnEnterHandler = (event: MinionSummonedEvent) => MaybePromise<void>;

export class OnEnterModifierMixin extends ModifierMixin<MinionCard> {
  private modifier!: Modifier<MinionCard>;
  private handler: OnEnterHandler;
  private onlyWhenPlayedFromHand: boolean;

  constructor(
    game: Game,
    options: { handler: OnEnterHandler; onlyWhenPlayedFromHand?: boolean }
  ) {
    super(game);
    this.handler = options.handler;
    this.onlyWhenPlayedFromHand = options.onlyWhenPlayedFromHand ?? false;
    this.onBeforePlay = this.onBeforePlay.bind(this);
  }

  onBeforePlay(event: CardBeforePlayEvent) {
    if (!event.data.card.equals(this.modifier.target)) {
      return;
    }
    if (this.onlyWhenPlayedFromHand && !event.data.card.isPlayedFromHand) return;

    const target = this.modifier.target;
    const unsub = this.game.on(GAME_EVENTS.MINION_SUMMONED, async event => {
      if (event.data.card.equals(target)) {
        unsub();
        if (event.data.card.isOnBoard) {
          await this.handler(event as any);
        }
      }
    });
  }

  onApplied(card: MinionCard, modifier: Modifier<MinionCard>): void {
    this.modifier = modifier;
    this.game.on(CARD_EVENTS.CARD_BEFORE_PLAY, this.onBeforePlay);
  }

  onRemoved(): void {
    this.game.off(CARD_EVENTS.CARD_BEFORE_PLAY, this.onBeforePlay);
  }

  async onReapplied() {}
}
