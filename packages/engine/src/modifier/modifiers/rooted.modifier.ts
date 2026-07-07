import { KEYWORDS } from '../../card/card-keywords';
import type { AnyCard } from '../../card/entities/card.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import type { Game } from '../../game/game';
import { MinionInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { RemoveOnDestroyedMixin } from '../mixins/remove-on-destroyed';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class RootedModifier extends Modifier<MinionCard> {
  constructor(
    game: Game,
    source: AnyCard,
    options: { mixins?: ModifierMixin<MinionCard>[] } = {}
  ) {
    super(KEYWORDS.ROOTED.id, game, source, {
      name: 'Rooted',
      description: 'This card is Rooted.',
      icon: 'icons/keyword-rooted',
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.ROOTED),
        new MinionInterceptorModifierMixin(game, {
          key: 'canMove',
          interceptor: () => false
        }),
        new RemoveOnDestroyedMixin(game),
        ...(options.mixins ?? [])
      ]
    });
  }
}
