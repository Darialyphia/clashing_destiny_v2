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
import { Player } from '../../player/player.entity';

export class ShooterModifier<T extends MinionCard> extends Modifier<T> {
  constructor(
    game: Game,
    source: AnyCard,
    options: { mixins?: ModifierMixin<T>[]; unitMixins?: ModifierMixin<Unit>[] } = {}
  ) {
    super(KEYWORDS.SHOOTER.id, game, source, {
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.SHOOTER),
        new UnitEffectModifierMixin(game, {
          getModifier: () =>
            new RangedUnitModifier(game, source, {
              mixins: options.unitMixins
            })
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
    super(options.modifierType ?? KEYWORDS.SHOOTER.id, game, source, {
      name: KEYWORDS.SHOOTER.name,
      description: KEYWORDS.SHOOTER.description,
      icon: 'icons/keyword-ranged',
      mixins: [
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
