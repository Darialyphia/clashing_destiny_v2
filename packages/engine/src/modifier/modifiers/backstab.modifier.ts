import { KEYWORDS } from '../../card/card-keywords';
import type { AnyCard } from '../../card/entities/card.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import type { Game } from '../../game/game';
import { MinionInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class BackstabModifier<T extends MinionCard> extends Modifier<T> {
  constructor(
    game: Game,
    source: AnyCard,
    { amount, mixins }: { amount: number; mixins?: ModifierMixin<MinionCard>[] }
  ) {
    super(KEYWORDS.BACKSTAB.id, game, source, {
      name: KEYWORDS.BACKSTAB.name,
      description: KEYWORDS.BACKSTAB.description,
      icon: 'icons/keyword-backstab',
      isUnique: false,
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.BACKSTAB),
        new MinionInterceptorModifierMixin(game, {
          key: 'dealtDamage',
          interceptor: (val, { target }) => {
            if (!target.isExhausted) return val;

            return val + amount;
          }
        }),
        ...(mixins ?? [])
      ]
    });
  }
}
