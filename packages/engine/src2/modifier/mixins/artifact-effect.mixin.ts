import { isDefined } from '@game/shared';
import type { Game } from '../../game/game';
import { ModifierMixin } from '../modifier-mixin';
import type { Modifier } from '../modifier.entity';
import type { ArtifactCard } from '../../card/entities/artifact-card.entity';
import type { ArtifactEquipedEvent } from '../../player/player-artifact.events';
import type { PlayerArtifact } from '../../player/player-artifact.entity';
import { ARTIFACT_EVENTS } from '../../player/player.enums';

export class ArtifactEffectModifierMixin<
  T extends ArtifactCard
> extends ModifierMixin<T> {
  modifier!: Modifier<T>;

  modifierToAdd!: Modifier<PlayerArtifact>;

  constructor(
    game: Game,
    private options: {
      getModifier: (artifact: PlayerArtifact) => Modifier<PlayerArtifact>;
    }
  ) {
    super(game);
    this.onEquipped = this.onEquipped.bind(this);
  }

  private async addModifier(artifact: PlayerArtifact) {
    this.modifierToAdd = this.options.getModifier(artifact);
    await artifact.modifiers.add(this.modifierToAdd);
  }

  private async onEquipped(event: ArtifactEquipedEvent) {
    if (!event.data.artifact.card.equals(this.modifier.target)) return;
    await this.addModifier(event.data.artifact);
  }

  async onApplied(target: T, modifier: Modifier<T>) {
    this.modifier = modifier;
    if (isDefined(this.modifier.target.artifact)) {
      await this.addModifier(this.modifier.target.artifact!);
    }
    this.game.on(ARTIFACT_EVENTS.ARTIFACT_EQUIPED, this.onEquipped);
  }

  async onRemoved() {
    this.game.off(ARTIFACT_EVENTS.ARTIFACT_EQUIPED, this.onEquipped);
    if (isDefined(this.modifier.target.artifact)) {
      await this.modifierToAdd.remove();
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onReapplied(): void {}
}
