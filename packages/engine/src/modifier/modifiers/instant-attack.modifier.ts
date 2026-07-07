import { KEYWORDS } from '../../card/card-keywords';
import type { AnyCard } from '../../card/entities/card.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import type { Game } from '../../game/game';
import { MinionInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class InstantAttackModifier extends Modifier<MinionCard> {
  constructor(
    game: Game,
    source: AnyCard,
    options?: { mixins: ModifierMixin<MinionCard>[] }
  ) {
    super(KEYWORDS.INSTANT_ATTACK.id, game, source, {
      name: KEYWORDS.INSTANT_ATTACK.name,
      description: KEYWORDS.INSTANT_ATTACK.description,
      icon: 'icons/keyword-instant-attack',
      mixins: [
        new MinionInterceptorModifierMixin(game, {
          key: 'shouldSwitchInitiativeAfterAttacking',
          interceptor: () => {
            return false;
          }
        }),

        ...(options?.mixins || [])
      ]
    });
  }
}
