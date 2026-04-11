import type { Game } from '../../game/game';
import type { ArtifactCard } from '../../card/entities/artifact-card.entity';
import type { Player } from '../player.entity';
import { PlayerArtifact } from '../player-artifact.entity';

export class ArtifactManagerComponent {
  private _artifacts: PlayerArtifact[] = [];

  constructor(
    private game: Game,
    private player: Player
  ) {}

  get artifacts() {
    return this._artifacts;
  }

  async equip(artifact: ArtifactCard) {
    if (this._artifacts.length >= this.game.config.MAX_EQUIPPED_ARTIFACTS) {
      const [artifactToUnequip] = await this.game.interaction.chooseCards<ArtifactCard>({
        player: this.player,
        choices: this._artifacts.map(a => a.card),
        label: 'Choose an artifact to unequip',
        minChoiceCount: 1,
        maxChoiceCount: 1,
        source: artifact
      });

      await this.player.artifactManager.unequip(artifactToUnequip);
    }

    const playerArtifact = new PlayerArtifact(this.game, {
      card: artifact,
      playerId: this.player.id
    });
    await playerArtifact.equip();
    this._artifacts.push(playerArtifact);

    return playerArtifact;
  }

  async unequip(artifact: ArtifactCard): Promise<void> {
    const index = this._artifacts.findIndex(a => a.card.equals(artifact));
    if (index === -1) return;

    this._artifacts.splice(index, 1);
  }
}
