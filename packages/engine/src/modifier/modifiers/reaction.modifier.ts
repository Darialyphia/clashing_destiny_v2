import { isDefined } from '@game/shared';
import { KEYWORDS } from '../../card/card-keywords';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import { CardInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import { Modifier } from '../modifier.entity';

export class ReactionModifier<T extends AnyCard> extends Modifier<T> {
  constructor(game: Game, source: AnyCard) {
    super(KEYWORDS.REACTION.id, game, source, {
      mixins: [
        new CardInterceptorModifierMixin(game, {
          // @ts-expect-error technically "canPlay" is not on the Card class itself, but on all its subclasses, so typescript is not happy
          key: 'canPlay',
          // @ts-expect-error
          interceptor(value: boolean) {
            if (!value) return value;
            return isDefined(game.effectChainSystem.currentChain);
          }
        })
      ]
    });
  }
}
