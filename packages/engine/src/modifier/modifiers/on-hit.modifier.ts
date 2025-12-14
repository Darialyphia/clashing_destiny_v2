import { KEYWORDS } from '../../card/card-keywords';
import type { CardAfterDealCombatDamageEvent } from '../../card/card.events';
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
      handler: (event: CardAfterDealCombatDamageEvent, modifier: Modifier<T>) => void;
    }
  ) {
    super(KEYWORDS.ON_HIT.id, game, source, {
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.ON_HIT),
        new GameEventModifierMixin(game, {
          eventName: GAME_EVENTS.CARD_AFTER_DEAL_COMBAT_DAMAGE,
          handler: event => this.onDamage(event)
        }),
        ...(options.mixins || [])
      ]
    });
  }

  private async onDamage(event: CardAfterDealCombatDamageEvent) {
    if (!event.data.card.equals(this.target)) return;
    if (event.data.target.isAttacking) return;
    await this.options.handler(event, this);
  }
}
