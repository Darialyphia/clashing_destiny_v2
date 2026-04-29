import type { ArtifactCard } from '../../card/entities/artifact-card.entity';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import type { PlayerArtifact } from '../../player/player-artifact.entity';
import { ArtifactEffectModifierMixin } from '../mixins/artifact-effect.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class WhileEquipedModifier<T extends ArtifactCard> extends Modifier<T> {
  constructor(
    game: Game,
    source: AnyCard,
    {
      modifier,
      mixins = [],
      modifierType = 'while-equiped'
    }: {
      modifier: Modifier<PlayerArtifact>;
      mixins?: ModifierMixin<T>[];
      modifierType?: string;
    }
  ) {
    super(modifierType, game, source, {
      mixins: [
        new ArtifactEffectModifierMixin(game, {
          getModifier: () => modifier
        }),
        ...mixins
      ]
    });
  }
}
