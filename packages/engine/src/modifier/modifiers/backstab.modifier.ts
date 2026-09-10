import { KEYWORDS } from '../../card/card-keywords';
import { isSpell } from '../../card/card-utils';
import type { AnyCard } from '../../card/entities/card.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import type { Game } from '../../game/game';
import { GAME_EVENTS } from '../../game/game.events';
import { AbilityDamage, SpellDamage } from '../../utils/damage';
import { GameEventModifierMixin } from '../mixins/game-event.mixin';
import { MinionInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { Modifier } from '../modifier.entity';

export class BackstabModifier<T extends MinionCard> extends Modifier<T> {
  constructor(game: Game, source: AnyCard, { amount }: { amount: number }) {
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
        })
      ]
    });
  }
}
