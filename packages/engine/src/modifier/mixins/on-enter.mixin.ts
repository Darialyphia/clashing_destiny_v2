import type { Modifier } from '../modifier.entity';
import { ModifierMixin } from '../modifier-mixin';
import { CARD_EVENTS } from '../../card/card.enums';
import type { Game } from '../../game/game';

import type { CardBeforePlayEvent } from '../../card/card.events';
import { GAME_EVENTS } from '../../game/game.events';
import { isArtifact, isHero, isMinion, isSigil } from '../../card/card-utils';
import type { MaybePromise } from '@game/shared';
import type { HeroCard } from '../../card/entities/hero.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import type { MinionSummonedEvent } from '../../card/events/minion.events';
import type { HeroPlayedEvent } from '../../card/events/hero.events';
import type { ArtifactCard } from '../../card/entities/artifact.entity';
import type { ArtifactEquipedEvent } from '../../card/events/artifact.events';
import type { SigilCard } from '../../card/entities/sigil.entity';
import type { SigilSummonedEvent } from '../../card/events/sigil.events';

export type OnEnterHandler<T extends MinionCard | ArtifactCard | HeroCard | SigilCard> = (
  event: T extends MinionCard
    ? MinionSummonedEvent
    : T extends SigilCard
      ? SigilSummonedEvent
      : T extends ArtifactCard
        ? ArtifactEquipedEvent
        : T extends HeroCard
          ? HeroPlayedEvent
          : never
) => MaybePromise<void>;

export class OnEnterModifierMixin<
  T extends MinionCard | ArtifactCard | HeroCard | SigilCard
> extends ModifierMixin<T> {
  private modifier!: Modifier<T>;
  private handler: OnEnterHandler<T>;
  private onlyWhenPlayedFromHand: boolean;

  constructor(
    game: Game,
    options: { handler: OnEnterHandler<T>; onlyWhenPlayedFromHand?: boolean }
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
    if (isMinion(target)) {
      const unsub = this.game.on(GAME_EVENTS.MINION_SUMMONED, async event => {
        if (event.data.card.equals(target)) {
          unsub();
          if (event.data.card.location !== 'board') return;
          await this.handler(event as any);
        }
      });
    } else if (isSigil(target)) {
      const unsub = this.game.on(GAME_EVENTS.SIGIL_SUMMONED, async event => {
        if (event.data.card.equals(target)) {
          unsub();
          if (event.data.card.location !== 'board') return;
          await this.handler(event as any);
        }
      });
    } else if (isArtifact(target)) {
      const unsub = this.game.on(GAME_EVENTS.ARTIFACT_EQUIPED, async event => {
        if (event.data.card.equals(target)) {
          unsub();
          if (event.data.card.location !== 'board') return;
          await this.handler(event as any);
        }
      });
    } else if (isHero(target)) {
      const unsub = this.game.on(GAME_EVENTS.HERO_PLAYED, async event => {
        if (event.data.card.equals(target)) {
          unsub();
          if (event.data.card.location !== 'board') return;
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
