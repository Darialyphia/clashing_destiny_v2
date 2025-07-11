import { KEYWORDS } from '../../card/card-keywords';
import type { AnyCard } from '../../card/entities/card.entity';
import type { HeroCard } from '../../card/entities/hero.entity';
import type { MinionCard } from '../../card/entities/minion.card';
import type { Game } from '../../game/game';
import { UnitInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { Modifier } from '../modifier.entity';

export class BlitzModifier<T extends MinionCard | HeroCard> extends Modifier<T> {
  constructor(game: Game, source: AnyCard) {
    super(KEYWORDS.BLITZ.id, game, source, {
      name: KEYWORDS.BLITZ.name,
      description: KEYWORDS.BLITZ.description,
      icon: 'keyword-blitz',
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.RUSH),
        new UnitInterceptorModifierMixin(game, {
          key: 'canBeBlocked',
          interceptor: () => false
        }),
        new UnitInterceptorModifierMixin(game, {
          key: 'canBeDefended',
          interceptor: () => false
        })
      ]
    });
  }
}
