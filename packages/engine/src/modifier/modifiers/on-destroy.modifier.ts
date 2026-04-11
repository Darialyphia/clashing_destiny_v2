import type { MaybePromise } from '@game/shared';
import { KEYWORDS } from '../../card/card-keywords';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import { GameEventModifierMixin } from '../mixins/game-event.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { Modifier } from '../modifier.entity';
import type { MinionCard } from '../../card/entities/minion-card.entity';
import {
  UnitEffectTriggeredEvent,
  type UnitAfterDestroyEvent
} from '../../unit/unit-events';
import type { ModifierMixin } from '../modifier-mixin';
import { UnitEffectModifierMixin } from '../mixins/unit-effect.mixin';
import type { Unit } from '../../unit/unit.entity';
import { UNIT_EVENTS } from '../../unit/unit.enums';
import { GAME_EVENTS } from '../../game/game.events';

export class MinionOnDestroyModifier extends Modifier<MinionCard> {
  constructor(
    game: Game,
    source: AnyCard,
    private options: {
      handler: (event: UnitAfterDestroyEvent) => MaybePromise<void>;
      mixins?: ModifierMixin<MinionCard>[];
    }
  ) {
    super(KEYWORDS.ON_DESTROYED.id, game, source, {
      name: KEYWORDS.ON_DESTROYED.name,
      description: KEYWORDS.ON_DESTROYED.description,
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.ON_DESTROYED),
        new UnitEffectModifierMixin(game, {
          getModifier: () =>
            new MinionOnDestroyUnitModifier(game, this.initialSource, {
              mixins: [],
              handler: options.handler
            })
        }),
        ...(options?.mixins ?? [])
      ]
    });
  }
}

export class MinionOnDestroyUnitModifier extends Modifier<Unit> {
  constructor(
    game: Game,
    source: AnyCard,
    options: {
      handler: (event: UnitAfterDestroyEvent) => MaybePromise<void>;
      mixins?: ModifierMixin<Unit>[];
      modifierType?: string;
    }
  ) {
    super(options.modifierType ?? KEYWORDS.ON_DESTROYED.id, game, source, {
      name: KEYWORDS.ON_DESTROYED.name,
      description: KEYWORDS.ON_DESTROYED.description,
      icon: 'icons/keyword-on-death',
      mixins: [
        new GameEventModifierMixin(game, {
          eventName: UNIT_EVENTS.UNIT_BEFORE_DESTROY,
          filter: event => {
            if (!event) return false;

            return event.data.unit.equals(this.target);
          },
          handler: async event => {
            if (!event) return; // dont trigger when event is triggered manually
            await this.game.emit(
              GAME_EVENTS.UNIT_EFFECT_TRIGGERED,
              new UnitEffectTriggeredEvent({
                unit: this.target
              })
            );
          }
        }),
        new GameEventModifierMixin(game, {
          eventName: UNIT_EVENTS.UNIT_AFTER_DESTROY,
          filter: event => {
            if (!event) return false;

            return event.data.unit.equals(this.target);
          },
          handler: event => {
            if (!event) return; // dont trigger when event is triggered manually
            return options.handler(event);
          }
        }),
        ...(options.mixins ?? [])
      ]
    });
  }
}
