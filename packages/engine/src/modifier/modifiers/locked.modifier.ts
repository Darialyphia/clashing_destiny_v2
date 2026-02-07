import { KEYWORDS } from '../../card/card-keywords';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import { GAME_PHASES } from '../../game/game.enums';
import { GAME_EVENTS } from '../../game/game.events';
import { DurationModifierMixin } from '../mixins/duration.mixin';
import { GameEventModifierMixin } from '../mixins/game-event.mixin';
import { CardInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class LockedModifier<T extends AnyCard> extends Modifier<T> {
  private hasBeenAttacked = 0;

  constructor(
    game: Game,
    source: AnyCard,
    options: { stacks: number; mixins?: ModifierMixin<T>[] }
  ) {
    super(KEYWORDS.LOCKED.id, game, source, {
      name: KEYWORDS.LOCKED.name,
      description: KEYWORDS.LOCKED.description,
      icon: 'keyword-locked',
      isUnique: true,
      stacks: options.stacks,
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.LOCKED),
        new CardInterceptorModifierMixin(game, {
          // @ts-expect-error
          key: 'canPlay',
          interceptor: () => {
            return false;
          }
        }),
        new CardInterceptorModifierMixin(game, {
          key: 'canBeRecollected',
          interceptor: () => {
            return false;
          }
        }),
        new CardInterceptorModifierMixin(game, {
          key: 'canBeUsedAsDestinyCost',
          interceptor: () => {
            return false;
          }
        }),
        new CardInterceptorModifierMixin(game, {
          key: 'canBeUsedAsManaCost',
          interceptor: () => {
            return false;
          }
        }),
        new GameEventModifierMixin(game, {
          eventName: GAME_EVENTS.AFTER_CHANGE_PHASE,
          filter(event) {
            return event.data.from === GAME_PHASES.DRAW;
          },
          handler: async e => {
            console.log(e);
            console.log('LockedModifier:remove stack', this.stacks);
            await this.removeStacks(1);
          }
        }),
        ...(options.mixins || [])
      ]
    });
  }
}
