import type { MaybePromise } from '@game/shared';
import { KEYWORDS } from '../../card/card-keywords';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import { GameEventModifierMixin } from '../mixins/game-event.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { Modifier } from '../modifier.entity';
import type { MinionCard } from '../../card/entities/minion-card.entity';
import type { UnitAfterDestroyEvent } from '../../unit/unit-events';
import type { ModifierMixin } from '../modifier-mixin';
import { UnitEffectModifierMixin } from '../mixins/unit-effect.mixin';
import type { Unit } from '../../unit/unit.entity';
import { UNIT_EVENTS } from '../../unit/unit.enums';

export class SlayModifier extends Modifier<MinionCard> {
  constructor(
    game: Game,
    source: AnyCard,
    private options: {
      handler: (event: UnitAfterDestroyEvent) => MaybePromise<void>;
      mixins?: ModifierMixin<MinionCard>[];
    }
  ) {
    super(KEYWORDS.SLAY.id, game, source, {
      name: KEYWORDS.SLAY.name,
      description: KEYWORDS.SLAY.description,
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.SLAY),
        new UnitEffectModifierMixin(game, {
          getModifier: () =>
            new SlayUnitModifier(game, this.initialSource, {
              mixins: [],
              handler: options.handler
            })
        }),
        ...(options?.mixins ?? [])
      ]
    });
  }
}

export class SlayUnitModifier extends Modifier<Unit> {
  constructor(
    game: Game,
    source: AnyCard,
    options: {
      handler: (event: UnitAfterDestroyEvent) => MaybePromise<void>;
      mixins?: ModifierMixin<Unit>[];
      modifierType?: string;
    }
  ) {
    super(options.modifierType ?? KEYWORDS.SLAY.id, game, source, {
      name: KEYWORDS.SLAY.name,
      description: KEYWORDS.SLAY.description,
      icon: 'icons/keyword-slay',
      mixins: [
        new GameEventModifierMixin(game, {
          eventName: UNIT_EVENTS.UNIT_AFTER_DESTROY,
          filter: event => {
            if (!event) return false;
            return event.data.source.equals(this.target.card);
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
