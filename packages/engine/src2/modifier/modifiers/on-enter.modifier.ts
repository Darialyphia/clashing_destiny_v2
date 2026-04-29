import { isFunction, type MaybePromise } from '@game/shared';
import { KEYWORDS } from '../../card/card-keywords';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import { GAME_EVENTS } from '../../game/game.events';
import { GameEventModifierMixin } from '../mixins/game-event.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { Modifier } from '../modifier.entity';
import type { MinionCard } from '../../card/entities/minion-card.entity';
import type { MinionAfterSummonedEvent } from '../../card/events/minion.events';
import type { ModifierMixin } from '../modifier-mixin';
import { UNIT_EVENTS } from '../../unit/unit.enums';
import { UnitEffectTriggeredEvent } from '../../unit/unit-events';

export class MinionOnEnterModifier extends Modifier<MinionCard> {
  constructor(
    game: Game,
    source: AnyCard,
    optionsOrHandler:
      | ((event: MinionAfterSummonedEvent) => MaybePromise<void>)
      | {
          handler: (event: MinionAfterSummonedEvent) => MaybePromise<void>;
          mixins?: ModifierMixin<MinionCard>[];
        }
  ) {
    super(KEYWORDS.ON_ENTER.id, game, source, {
      name: KEYWORDS.ON_ENTER.name,
      description: KEYWORDS.ON_ENTER.description,
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.ON_ENTER),
        new GameEventModifierMixin(game, {
          eventName: GAME_EVENTS.MINION_AFTER_SUMMON,
          filter: event => {
            if (!event) return false;

            return (
              event.data.card.equals(this.target) &&
              !!this.target.player.currentlyPlayedCard?.equals(this.target)
            );
          },
          handler: async event => {
            if (!event) return; // dont trigger when event is triggered manually
            await this.game.emit(
              UNIT_EVENTS.UNIT_EFFECT_TRIGGERED,
              new UnitEffectTriggeredEvent({ unit: this.target.unit })
            );
            const _handler = isFunction(optionsOrHandler)
              ? optionsOrHandler
              : optionsOrHandler.handler;
            return _handler(event);
          }
        }),
        ...(isFunction(optionsOrHandler) || !optionsOrHandler.mixins
          ? []
          : optionsOrHandler.mixins)
      ]
    });
  }
}
