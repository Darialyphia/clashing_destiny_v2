import { KEYWORDS } from '../../card/card-keywords';
import type { AnyCard } from '../../card/entities/card.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import type { Game } from '../../game/game';
import { MinionInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class VigilantModifier<T extends MinionCard> extends Modifier<T> {
  constructor(game: Game, source: AnyCard, options?: { mixins?: ModifierMixin<T>[] }) {
    super(KEYWORDS.VIGILANT.id, game, source, {
      name: KEYWORDS.VIGILANT.name,
      description: KEYWORDS.VIGILANT.description,
      icon: 'icons/keyword-vigilant',
      isUnique: false,
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.VIGILANT),
        new MinionInterceptorModifierMixin(game, {
          key: 'canRetaliateWhileExhausted',
          interceptor: () => true
        }),
        ...(options?.mixins ?? [])
      ]
    });
  }
}
