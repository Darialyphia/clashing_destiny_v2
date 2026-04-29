import type { AnyCard } from '../../card/entities/card.entity';
import type { MinionCard } from '../../card/entities/minion-card.entity';
import type { Game } from '../../game/game';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';
import { KEYWORDS } from '../../card/card-keywords';
import { UnitEffectModifierMixin } from '../mixins/unit-effect.mixin';
import type { Unit } from '../../unit/unit.entity';
import { UnitInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';

export class StealthModifier extends Modifier<MinionCard> {
  constructor(
    game: Game,
    source: AnyCard,
    options?: { mixins: ModifierMixin<MinionCard>[] }
  ) {
    super(KEYWORDS.STEALTH.id, game, source, {
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.STEALTH),
        new UnitEffectModifierMixin(game, {
          getModifier: () => new StealthUnitModifier(game, source, {})
        }),
        ...(options?.mixins ?? [])
      ]
    });
  }
}

export class StealthUnitModifier extends Modifier<Unit> {
  constructor(
    game: Game,
    source: AnyCard,
    options: {
      mixins?: ModifierMixin<Unit>[];
      modifierType?: string;
      isRemovable?: boolean;
    }
  ) {
    super(options.modifierType ?? KEYWORDS.STEALTH.id, game, source, {
      name: KEYWORDS.STEALTH.name,
      description: KEYWORDS.STEALTH.description,
      icon: 'icons/keyword-stealth',
      mixins: [
        new UnitInterceptorModifierMixin(game, {
          key: 'canBeAttackTarget',
          interceptor: val => {
            if (!val) return val;
            return this.target.isExhausted;
          }
        }),
        new UnitInterceptorModifierMixin(game, {
          key: 'canBeCardTarget',
          interceptor: (val, ctx) => {
            if (!val) return val;
            if (ctx.card.player.equals(this.target.player)) return true;
            return this.target.isExhausted;
          }
        }),
        ...(options.mixins ?? [])
      ]
    });
  }
}
