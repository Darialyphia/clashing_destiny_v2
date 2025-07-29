import type { Game } from '../../game/game';
import { ArtifactCard } from '../../card/entities/artifact.entity';
import type { Player } from '../player.entity';

export class ArtifactManagerComponent {
  private _artifacts: ArtifactCard[] = [];

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
        choices: this._artifacts,
        minChoiceCount: 1,
        maxChoiceCount: 1,
        label: 'Choose an artifact to unequip'
      });

      await this.unequip(artifactToUnequip);
    }

    this._artifacts.push(artifact);
  }

  async unequip(artifact: ArtifactCard) {
    const index = this._artifacts.findIndex(a => a.equals(artifact));
    if (index === -1) return;

    this._artifacts.splice(index, 1);
  }
}
