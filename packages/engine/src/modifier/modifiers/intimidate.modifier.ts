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

export class IntimidateCardModifier<T extends MinionCard> extends Modifier<T> {
  constructor(
    game: Game,
    source: AnyCard,
    options: { threshold: number; mixins?: ModifierMixin<T>[] }
  ) {
    super(KEYWORDS.INTIMIDATE.id, game, source, {
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.INTIMIDATE),
        new UnitEffectModifierMixin(game, {
          getModifier: () =>
            new IntimidateUnitModifier(game, this.initialSource, {
              mixins: [],
              threshold: options?.threshold
            })
        }),
        ...(options?.mixins ?? [])
      ]
    });
  }
}

export class IntimidateUnitModifier extends Modifier<Unit> {
  constructor(
    game: Game,
    source: AnyCard,
    options: {
      mixins?: ModifierMixin<Unit>[];
      modifierType?: string;
      isRemovable?: boolean;
      threshold: number;
    }
  ) {
    super(options.modifierType ?? KEYWORDS.INTIMIDATE.id, game, source, {
      name: KEYWORDS.INTIMIDATE.name,
      description: KEYWORDS.INTIMIDATE.description,
      icon: 'icons/keyword-intimidate',
      mixins: [
        new UnitInterceptorModifierMixin(game, {
          key: 'canBeCounterattackTarget',
          interceptor: (value, ctx) => {
            if (!value) return value;
            return ctx.attacker.card.manaCost > options.threshold;
          }
        }),
        ...(options.mixins ?? [])
      ]
    });
  }
}
