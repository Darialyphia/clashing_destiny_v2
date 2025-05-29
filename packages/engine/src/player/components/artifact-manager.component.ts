import type { Nullable } from '@game/shared';
import { ARTIFACT_KINDS, type ArtifactKind } from '../../card/card.enums';
import { match } from 'ts-pattern';
import type { Game } from '../../game/game';
import type { ArtifactCard } from '../../card/entities/artifact.entity';
import type { Player } from '../player.entity';

export class ArtifactManagerComponent {
  private weapon: Nullable<ArtifactCard> = null;

  private armor: Nullable<ArtifactCard> = null;

  private relic: Nullable<ArtifactCard> = null;

  constructor(
    private game: Game,
    private player: Player
  ) {}

  get artifacts() {
    return {
      weapon: this.weapon,
      armor: this.armor,
      relic: this.relic
    };
  }

  equip(artifact: ArtifactCard) {
    return match(artifact.subkind)
      .with(ARTIFACT_KINDS.WEAPON, () => {
        this.weapon = artifact;
      })
      .with(ARTIFACT_KINDS.ARMOR, () => {
        this.armor = artifact;
      })
      .with(ARTIFACT_KINDS.RELIC, () => {
        this.relic = artifact;
      })
      .exhaustive();
  }

  async unequip(artifactKind: ArtifactKind) {
    await match(artifactKind)
      .with(ARTIFACT_KINDS.WEAPON, async () => {
        if (!this.weapon) return;
        await this.weapon.destroy();

        this.weapon = null;
      })
      .with(ARTIFACT_KINDS.ARMOR, async () => {
        if (!this.armor) return;

        await this.armor.destroy();
        this.armor = null;
      })
      .with(ARTIFACT_KINDS.RELIC, async () => {
        if (!this.relic) return;

        await this.relic.destroy();
        this.relic = null;
      })
      .exhaustive();
  }
}
