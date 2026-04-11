import { KEYWORDS } from '../../card/card-keywords';
import { isArtifact, isMinion } from '../../card/card-utils';
import type { ArtifactCard } from '../../card/entities/artifact-card.entity';
import type { AnyCard } from '../../card/entities/card.entity';
import type { MinionCard } from '../../card/entities/minion-card.entity';
import type { Game } from '../../game/game';
import { CardInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import { Modifier } from '../modifier.entity';

export class UniqueModifier<T extends MinionCard | ArtifactCard> extends Modifier<T> {
  constructor(game: Game, source: AnyCard) {
    super(KEYWORDS.UNIQUE.id, game, source, {
      name: KEYWORDS.UNIQUE.name,
      description: KEYWORDS.UNIQUE.description,
      mixins: [
        new CardInterceptorModifierMixin(game, {
          key: 'canPlay',
          interceptor: canPlay => {
            if (!canPlay) return false;

            if (isMinion(this.target)) {
              return !this.game.unitSystem.units.some(u => u.card.equals(this));
            }
            if (isArtifact(this.target)) {
              return this.target.player.artifactManager.artifacts.some(artifact =>
                artifact.card.equals(this)
              );
            }

            return true;
          }
        })
      ]
    });
  }
}
