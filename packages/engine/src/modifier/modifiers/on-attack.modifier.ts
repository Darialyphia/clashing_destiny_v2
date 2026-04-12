import type { MaybePromise } from '@game/shared';
import { KEYWORDS } from '../../card/card-keywords';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import { GameEventModifierMixin } from '../mixins/game-event.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { Modifier } from '../modifier.entity';
import type { MinionCard } from '../../card/entities/minion-card.entity';
import type { ModifierMixin } from '../modifier-mixin';
import { UnitEffectModifierMixin } from '../mixins/unit-effect.mixin';
import type { Unit } from '../../unit/unit.entity';
import { UNIT_EVENTS } from '../../unit/unit.enums';
import { COMBAT_EVENTS, type CombatAttackEvent } from '../../combat/combat.events';

export class MinionOnAttackModifier extends Modifier<MinionCard> {
  constructor(
    game: Game,
    source: AnyCard,
    private options: {
      handler: (event: CombatAttackEvent) => MaybePromise<void>;
      mixins?: ModifierMixin<MinionCard>[];
    }
  ) {
    super(KEYWORDS.ON_ATTACK.id, game, source, {
      name: KEYWORDS.ON_ATTACK.name,
      description: KEYWORDS.ON_ATTACK.description,
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.ON_ATTACK),
        new UnitEffectModifierMixin(game, {
          getModifier: () =>
            new MinionOnAttackUnitModifier(game, this.initialSource, {
              mixins: [],
              handler: options.handler
            })
        }),
        ...(options?.mixins ?? [])
      ]
    });
  }
}

export class MinionOnAttackUnitModifier extends Modifier<Unit> {
  constructor(
    game: Game,
    source: AnyCard,
    options: {
      handler: (event: CombatAttackEvent) => MaybePromise<void>;
      mixins?: ModifierMixin<Unit>[];
      modifierType?: string;
    }
  ) {
    super(options.modifierType ?? KEYWORDS.ON_ATTACK.id, game, source, {
      name: KEYWORDS.ON_ATTACK.name,
      description: KEYWORDS.ON_ATTACK.description,
      icon: 'icons/keyword-on-attack',
      mixins: [
        new GameEventModifierMixin(game, {
          eventName: COMBAT_EVENTS.COMBAT_BEFORE_ATTACK,
          filter: event => {
            if (!event) return false;

            return event.data.attacker.equals(this.target);
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
