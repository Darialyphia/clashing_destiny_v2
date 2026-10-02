import { KEYWORDS } from '../../card/card-keywords';
import type { AnyCard } from '../../card/entities/card.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import type { Game } from '../../game/game';
import { MinionInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class StructureModifier<T extends MinionCard> extends Modifier<T> {
  constructor(game: Game, source: AnyCard, options?: { mixins?: ModifierMixin<T>[] }) {
    super(KEYWORDS.STRUCTURE.id, game, source, {
      name: KEYWORDS.STRUCTURE.name,
      description: KEYWORDS.STRUCTURE.description,
      isUnique: false,
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.STRUCTURE),
        new MinionInterceptorModifierMixin(game, {
          key: 'canMove',
          interceptor: () => false
        }),
        new MinionInterceptorModifierMixin(game, {
          key: 'canAttack',
          interceptor: () => false
        }),
        new MinionInterceptorModifierMixin(game, {
          key: 'canRetaliate',
          interceptor: () => false
        }),
        ...(options?.mixins ?? [])
      ]
    });
  }
}
