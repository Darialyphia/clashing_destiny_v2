import type { MaybePromise } from '@game/shared';
import { KEYWORDS } from '../../card/card-keywords';
import type { CardAfterDestroyEvent } from '../../card/card.events';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import { GAME_EVENTS } from '../../game/game.events';
import { GameEventModifierMixin } from '../mixins/game-event.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class OnDeathModifier<T extends AnyCard> extends Modifier<T> {
  constructor(
    game: Game,
    source: AnyCard,
    options: {
      mixins?: ModifierMixin<T>[];
      handler: (
        event: CardAfterDestroyEvent,
        modifier: Modifier<T>
      ) => MaybePromise<void>;
    }
  ) {
    super(KEYWORDS.ON_DESTROYED.id, game, source, {
      name: KEYWORDS.ON_DESTROYED.name,
      description: KEYWORDS.ON_DESTROYED.description,
      icon: 'keyword-on-death',
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.ON_DESTROYED),
        new GameEventModifierMixin(game, {
          eventName: GAME_EVENTS.CARD_AFTER_DESTROY,
          handler: async event => {
            if (event.data.card.equals(this.target)) {
              await options.handler(event, this);
            }
          }
        }),
        ...(options.mixins || [])
      ]
    });
  }
}
