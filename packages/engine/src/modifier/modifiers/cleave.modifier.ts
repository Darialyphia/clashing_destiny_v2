import { KEYWORDS } from '../../card/card-keywords';
import type { AnyCard } from '../../card/entities/card.entity';
import type { HeroCard } from '../../card/entities/hero.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import type { Game } from '../../game/game';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { Modifier } from '../modifier.entity';
import type { ModifierMixin } from '../modifier-mixin';
import { UnitInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import { CleaveAOE } from '../../card/attack-aoe';

export class CleaveModifier<T extends MinionCard | HeroCard> extends Modifier<T> {
  constructor(
    game: Game,
    source: AnyCard,
    { mixins }: { mixins?: ModifierMixin<T>[] } = {}
  ) {
    super(KEYWORDS.CLEAVE.id, game, source, {
      name: KEYWORDS.CLEAVE.name,
      description: KEYWORDS.CLEAVE.description,
      icon: 'keyword-cleave',
      isUnique: true,
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.CLEAVE),
        new UnitInterceptorModifierMixin(game, {
          key: 'attackAOEs',
          interceptor: value => {
            return [...value, new CleaveAOE()];
          }
        }),
        ...(mixins ?? [])
      ]
    });
  }
}
