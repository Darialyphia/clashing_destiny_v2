import { KEYWORDS } from '../../card/card-keywords';
import type { AnyCard } from '../../card/entities/card.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import type { Game } from '../../game/game';
import { GAME_EVENTS } from '../../game/game.events';
import { MinionInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import { UntilEventModifierMixin } from '../mixins/until-event';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class ShieldModifier<T extends MinionCard> extends Modifier<T> {
  constructor(
    game: Game,
    source: AnyCard,
    options: { mixins?: ModifierMixin<T>[] } = { mixins: [] }
  ) {
    super(KEYWORDS.SHIELD.id, game, source, {
      icon: 'icons/keyword-shield',
      name: KEYWORDS.SHIELD.name,
      description: KEYWORDS.SHIELD.description,
      isUnique: true,
      mixins: [
        new MinionInterceptorModifierMixin(game, {
          key: 'receivedDamage',
          interceptor: () => {
            return 0;
          }
        }),
        new UntilEventModifierMixin(game, {
          eventName: GAME_EVENTS.CARD_AFTER_TAKE_DAMAGE,
          filter: event => event.data.card.equals(this.target)
        }),
        ...(options.mixins || [])
      ]
    });
  }
}
