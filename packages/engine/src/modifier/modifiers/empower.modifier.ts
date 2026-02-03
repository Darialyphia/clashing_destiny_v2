import { KEYWORDS } from '../../card/card-keywords';
import { isSpell } from '../../card/card-utils';
import type { AnyCard } from '../../card/entities/card.entity';
import type { HeroCard } from '../../card/entities/hero.entity';
import type { Game } from '../../game/game';
import { GAME_EVENTS } from '../../game/game.events';
import { HeroInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import { UntilEndOfTurnModifierMixin } from '../mixins/until-end-of-turn.mixin';
import { UntilEventModifierMixin } from '../mixins/until-event';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class EmpowerModifier extends Modifier<HeroCard> {
  constructor(
    game: Game,
    source: AnyCard,
    options: { amount: number; mixins?: ModifierMixin<HeroCard>[] }
  ) {
    super(`${KEYWORDS.EMPOWER.id}-${source.id}`, game, source, {
      isUnique: true,
      stacks: options.amount,
      name: KEYWORDS.EMPOWER.name,
      description: KEYWORDS.EMPOWER.description,
      icon: 'keyword-empower-buff',
      mixins: [
        new HeroInterceptorModifierMixin(game, {
          key: 'spellPower',
          interceptor: value => value + this.stacks
        }),
        new UntilEndOfTurnModifierMixin(game),
        new UntilEventModifierMixin(game, {
          eventName: GAME_EVENTS.CARD_AFTER_PLAY,
          filter: event => {
            if (event.data.card.equals(source)) return false;
            if (!event.data.card.player.equals(this.target.player)) return false;
            if (!isSpell(event.data.card)) return false;

            return true;
          }
        }),
        ...(options.mixins ?? [])
      ]
    });
  }
}
