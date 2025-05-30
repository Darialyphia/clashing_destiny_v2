import { KEYWORDS } from '../../card/card-keywords';
import type { ArtifactCard } from '../../card/entities/artifact.entity';
import type { AnyCard } from '../../card/entities/card.entity';
import type { LocationCard } from '../../card/entities/location.entity';
import type { MinionCard } from '../../card/entities/minion.card';
import type { Game } from '../../game/game';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { OnEnterModifierMixin, type OnEnterHandler } from '../mixins/on-enter.mixin';
import { Modifier } from '../modifier.entity';

export class OnEnterModifier<
  T extends MinionCard | ArtifactCard | LocationCard
> extends Modifier<T> {
  constructor(game: Game, source: AnyCard, handler: OnEnterHandler<T>) {
    super(KEYWORDS.ON_ENTER.id, game, source, {
      mixins: [
        new OnEnterModifierMixin<T>(game, handler),
        new KeywordModifierMixin(game, KEYWORDS.ON_ENTER)
      ]
    });
  }
}
