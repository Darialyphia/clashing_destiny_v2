import { KEYWORDS } from '../../card/card-keywords';
import type { AnyCard } from '../../card/entities/card.entity';
import type { HeroCard } from '../../card/entities/hero-card.entity';
import type { MinionCard } from '../../card/entities/minion-card.entity';
import type { Game } from '../../game/game';
import type { Unit } from '../../unit/unit.entity';
import { DAMAGE_TYPES } from '../../utils/damage';
import {
  HeroCardInterceptorModifierMixin,
  UnitInterceptorModifierMixin
} from '../mixins/interceptor.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { UnitEffectModifierMixin } from '../mixins/unit-effect.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class SpellGuardModifier<T extends MinionCard> extends Modifier<T> {
  constructor(
    game: Game,
    source: AnyCard,
    options: { amount: number; mixins?: ModifierMixin<T>[] }
  ) {
    super(KEYWORDS.ELUSIVE.id, game, source, {
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.SPELL_GUARD),
        new UnitEffectModifierMixin(game, {
          getModifier: () => {
            return new SpellGuardUnitModifier(game, this.initialSource, {
              amount: options.amount,
              mixins: []
            });
          }
        }),
        ...(options?.mixins ?? [])
      ]
    });
  }
}

export class SpellGuardUnitModifier extends Modifier<Unit> {
  constructor(
    game: Game,
    source: AnyCard,
    options: { amount: number; mixins?: ModifierMixin<Unit>[] }
  ) {
    super(KEYWORDS.SPELL_GUARD.id, game, source, {
      isUnique: true,
      name: () => KEYWORDS.SPELL_GUARD.name.replace('(X)', `(${options.amount})`),
      description: () =>
        KEYWORDS.SPELL_GUARD.description.replace(' X ', ` ${options.amount} `),
      icon: 'icons/keyword-spell-guard',
      mixins: [
        new UnitInterceptorModifierMixin(game, {
          key: 'damageReceived',
          interceptor(value, ctx) {
            if (ctx.damage.type !== DAMAGE_TYPES.SPELL) return value;
            return Math.max(0, ctx.amount - options.amount);
          }
        }),
        ...(options.mixins ?? [])
      ]
    });
  }
}

export class SpellGuardHeroModifier extends Modifier<HeroCard> {
  constructor(
    game: Game,
    source: AnyCard,
    options: { amount: number; mixins?: ModifierMixin<HeroCard>[] }
  ) {
    super(KEYWORDS.SPELL_GUARD.id, game, source, {
      isUnique: true,
      name: () => KEYWORDS.SPELL_GUARD.name.replace('(X)', `(${options.amount})`),
      description: () =>
        KEYWORDS.SPELL_GUARD.description.replace(' X ', ` ${options.amount} `),
      icon: 'icons/keyword-spell-guard',
      mixins: [
        new HeroCardInterceptorModifierMixin(game, {
          key: 'damageReceived',
          interceptor(value, ctx) {
            if (ctx.damage.type !== DAMAGE_TYPES.SPELL) return value;
            return Math.max(0, ctx.amount - options.amount);
          }
        }),
        ...(options.mixins ?? [])
      ]
    });
  }
}
