import { KEYWORDS } from '../../card/card-keywords';
import { CARD_KINDS } from '../../card/card.enums';
import type { AnyCard } from '../../card/entities/card.entity';
import type { MinionCard } from '../../card/entities/minion-card.entity';
import type { Game } from '../../game/game';
import type { Unit } from '../../unit/unit.entity';
import { UnitInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { UnitEffectModifierMixin } from '../mixins/unit-effect.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class MagicVeilModifier<T extends MinionCard> extends Modifier<T> {
  constructor(
    game: Game,
    source: AnyCard,
    options?: { mixins: ModifierMixin<T>[]; unitMixins?: ModifierMixin<Unit>[] }
  ) {
    super(KEYWORDS.MAGIC_VEIL.id, game, source, {
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.MAGIC_VEIL),
        new UnitEffectModifierMixin(game, {
          getModifier: () => {
            return new MagicVeilUnitModifier(game, this.initialSource, {
              mixins: options?.unitMixins ?? []
            });
          }
        }),
        ...(options?.mixins ?? [])
      ]
    });
  }
}

export class MagicVeilUnitModifier extends Modifier<Unit> {
  constructor(game: Game, source: AnyCard, options: { mixins?: ModifierMixin<Unit>[] }) {
    super(KEYWORDS.MAGIC_VEIL.id, game, source, {
      isUnique: true,
      name: KEYWORDS.MAGIC_VEIL.name,
      description: KEYWORDS.MAGIC_VEIL.description,
      icon: 'icons/keyword-magic-veil',
      mixins: [
        new UnitInterceptorModifierMixin(game, {
          key: 'canBeCardTarget',
          interceptor(value, ctx) {
            if (ctx.card.kind !== CARD_KINDS.SPELL) return value;
            return false;
          }
        }),
        ...(options.mixins ?? [])
      ]
    });
  }
}
