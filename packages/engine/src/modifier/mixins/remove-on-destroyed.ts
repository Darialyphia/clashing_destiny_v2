import type {
  CardAfterDestroyEvent,
  CardChangeLocationEvent
} from '../../card/card.events';
import type { ArtifactCard } from '../../card/entities/artifact.entity';
import type { AnyCard } from '../../card/entities/card.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import type { Game } from '../../game/game';
import { GAME_EVENTS } from '../../game/game.events';
import { ModifierMixin } from '../modifier-mixin';
import type { Modifier } from '../modifier.entity';

export class RemoveOnDestroyedMixin extends ModifierMixin<AnyCard> {
  private modifier!: Modifier<AnyCard>;

  constructor(game: Game) {
    super(game);
    this.onCardDestroyed = this.onCardDestroyed.bind(this);
  }

  async onCardDestroyed(event: CardAfterDestroyEvent) {
    if (event.data.card.equals(this.modifier.target)) {
      this.game.off(GAME_EVENTS.CARD_AFTER_DESTROY, this.onCardDestroyed);
      await this.modifier.target.modifiers.remove(this.modifier);
    }
  }

  onApplied(target: AnyCard, modifier: Modifier<AnyCard>): void {
    this.modifier = modifier;

    this.game.on(GAME_EVENTS.CARD_AFTER_DESTROY, this.onCardDestroyed);
  }

  onRemoved(): void {
    this.game.off(GAME_EVENTS.CARD_AFTER_DESTROY, this.onCardDestroyed);
  }

  async onReapplied() {}
}

export class RemoveOnLeaveBoardModifierMixin extends ModifierMixin<
  MinionCard | ArtifactCard
> {
  private modifier!: Modifier<MinionCard | ArtifactCard>;

  constructor(game: Game) {
    super(game);
    this.onLocationChange = this.onLocationChange.bind(this);
  }

  async onLocationChange(event: CardChangeLocationEvent) {
    if (!event.data.card.equals(this.modifier.target)) return;
    if (!this.modifier.target.isOnBoard) return;
    await this.modifier.target.modifiers.remove(this.modifier as any);

    this.game.off(GAME_EVENTS.CARD_AFTER_CHANGE_LOCATION, this.onLocationChange);
  }

  onApplied(
    target: MinionCard | ArtifactCard,
    modifier: Modifier<MinionCard | ArtifactCard>
  ): void {
    this.modifier = modifier;

    this.game.on(GAME_EVENTS.CARD_AFTER_CHANGE_LOCATION, this.onLocationChange);
  }

  onRemoved(): void {
    this.game.off(GAME_EVENTS.CARD_AFTER_CHANGE_LOCATION, this.onLocationChange);
  }

  async onReapplied() {}
}
