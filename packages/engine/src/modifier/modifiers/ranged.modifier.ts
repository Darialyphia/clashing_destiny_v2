import type { AnyCard } from '../../card/entities/card.entity';
import type { MinionCard } from '../../card/entities/minion-card.entity';
import type { Game } from '../../game/game';
import { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';
import { KEYWORDS } from '../../card/card-keywords';
import { UnitEffectModifierMixin } from '../mixins/unit-effect.mixin';
import { Unit } from '../../unit/unit.entity';
import { UnitInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { TARGETING_TYPE } from '../../targeting/targeting-strategy';
import { RangedTargetingStrategy } from '../../targeting/ranged-targeting-strategy';
import { Player } from '../../player/player.entity';

export class RangedModifier<T extends MinionCard> extends Modifier<T> {
  constructor(game: Game, source: AnyCard, options: { mixins?: ModifierMixin<T>[] }) {
    super(KEYWORDS.RANGED.id, game, source, {
      name: KEYWORDS.RANGED.name,
      description: KEYWORDS.RANGED.description,
      icon: 'icons/keyword-ranged',
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.RANGED),
        new UnitEffectModifierMixin(game, {
          getModifier: () => new RangedUnitModifier(game, source, {})
        }),
        ...(options?.mixins ?? [])
      ]
    });
  }
}

export class RangedUnitModifier extends Modifier<Unit> {
  constructor(
    game: Game,
    source: AnyCard,
    private options: {
      mixins?: ModifierMixin<Unit>[];
      modifierType?: string;
    }
  ) {
    super(options.modifierType ?? KEYWORDS.RANGED.id, game, source, {
      name: KEYWORDS.RANGED.name,
      description: KEYWORDS.RANGED.description,
      icon: 'icons/keyword-ranged',
      mixins: [
        new UnitInterceptorModifierMixin(game, {
          key: 'attackTargetingPattern',
          interceptor: () =>
            new RangedTargetingStrategy(game, this.target, TARGETING_TYPE.ENEMY_UNIT)
        }),
        new UnitInterceptorModifierMixin(game, {
          key: 'canBeCounterattackTarget',
          interceptor: (value, ctx) => {
            if (!this.target.player.isTurnPlayer) return value;
            if (ctx.attacker instanceof Player) return value;
            return ctx.attacker.modifiers.has(RangedUnitModifier);
          }
        }),
        ...(options.mixins ?? [])
      ]
    });
  }
}
