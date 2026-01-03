import { KEYWORDS } from '../../card/card-keywords';
import type { CardAfterTakeDamageEvent } from '../../card/card.events';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import { GAME_EVENTS } from '../../game/game.events';
import { GameEventModifierMixin } from '../mixins/game-event.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class OnHitModifier<T extends AnyCard> extends Modifier<T> {
  constructor(
    game: Game,
    source: AnyCard,
    private options: {
      mixins?: ModifierMixin<T>[];
      handler: (event: CardAfterTakeDamageEvent, modifier: Modifier<T>) => void;
    }
  ) {
    super(KEYWORDS.ON_HIT.id, game, source, {
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.ON_HIT),
        new GameEventModifierMixin(game, {
          eventName: GAME_EVENTS.CARD_AFTER_TAKE_DAMAGE,
          filter: event => {
            return event.data.source.equals(this.target);
          },
          handler: event => this.onDamage(event)
        }),
        ...(options.mixins || [])
      ]
    });
  }

  private async onDamage(event: CardAfterTakeDamageEvent) {
    await this.options.handler(event, this);
  }
}
