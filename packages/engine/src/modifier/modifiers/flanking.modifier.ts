import { KEYWORDS } from '../../card/card-keywords';
import type { AnyCard } from '../../card/entities/card.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import type { Game } from '../../game/game';
import { MinionInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class FlankingModifier<T extends MinionCard> extends Modifier<T> {
  constructor(
    game: Game,
    source: AnyCard,
    options: { amount: number; mixins?: ModifierMixin<T>[] } = { mixins: [], amount: 1 }
  ) {
    super(KEYWORDS.FLANKING.id, game, source, {
      icon: 'icons/keyword-flanking',
      name: KEYWORDS.FLANKING.name,
      description: KEYWORDS.FLANKING.description,
      isUnique: true,
      mixins: [
        new MinionInterceptorModifierMixin(game, {
          key: 'canMoveBetweenBattlefields',
          interceptor: () => {
            return true;
          }
        }),
        ...(options.mixins || [])
      ]
    });
  }
}
