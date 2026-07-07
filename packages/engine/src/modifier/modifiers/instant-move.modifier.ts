import { KEYWORDS } from '../../card/card-keywords';
import type { AnyCard } from '../../card/entities/card.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import type { Game } from '../../game/game';
import { MinionInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class InstantMoveModifier extends Modifier<MinionCard> {
  constructor(
    game: Game,
    source: AnyCard,
    options?: { mixins: ModifierMixin<MinionCard>[] }
  ) {
    super(KEYWORDS.INSTANT_MOVE.id, game, source, {
      name: KEYWORDS.INSTANT_MOVE.name,
      description: KEYWORDS.INSTANT_MOVE.description,
      icon: 'icons/keyword-instant-move',
      mixins: [
        new MinionInterceptorModifierMixin(game, {
          key: 'shouldSwitchInitiativeAfterMovingManually',
          interceptor: () => {
            return false;
          }
        }),

        ...(options?.mixins || [])
      ]
    });
  }
}
