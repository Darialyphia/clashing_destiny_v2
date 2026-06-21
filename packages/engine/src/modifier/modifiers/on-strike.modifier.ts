import { KEYWORDS } from '../../card/card-keywords';
import {
  CardAfterDealCombatDamageEvent,
  CardEffectTriggeredEvent
} from '../../card/card.events';
import type { AnyCard } from '../../card/entities/card.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import type { Game } from '../../game/game';
import { GAME_EVENTS } from '../../game/game.events';
import { GameEventModifierMixin } from '../mixins/game-event.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class OnStrikeModifier<T extends MinionCard> extends Modifier<T> {
  constructor(
    game: Game,
    source: AnyCard,
    private options: {
      mixins?: ModifierMixin<T>[];
      handler: (event: CardAfterDealCombatDamageEvent, modifier: Modifier<T>) => void;
    }
  ) {
    super(KEYWORDS.ON_STRIKE.id, game, source, {
      name: KEYWORDS.ON_STRIKE.name,
      description: KEYWORDS.ON_STRIKE.description,
      icon: 'icons/keyword-on-attack',
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.ON_STRIKE),
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
    await this.game.emit(
      GAME_EVENTS.CARD_EFFECT_TRIGGERED,
      new CardEffectTriggeredEvent({
        card: this.target,
        message: `${this.target.blueprint.name} triggers its On Strike effect.`
      })
    );
    await this.options.handler(event, this);
  }
}
