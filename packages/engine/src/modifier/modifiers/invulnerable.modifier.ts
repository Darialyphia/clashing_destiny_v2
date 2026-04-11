import type { AnyCard } from '../../card/entities/card.entity';
import type { MinionCard } from '../../card/entities/minion-card.entity';
import type { Game } from '../../game/game';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';
import { KEYWORDS } from '../../card/card-keywords';
import { UnitEffectModifierMixin } from '../mixins/unit-effect.mixin';
import { Unit } from '../../unit/unit.entity';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { UnitInterceptorModifierMixin } from '../mixins/interceptor.mixin';

export class InvulnerableCardModifier<T extends MinionCard> extends Modifier<T> {
  constructor(
    game: Game,
    source: AnyCard,
    options?: { mixins: ModifierMixin<T>[]; unitMixins?: ModifierMixin<Unit>[] }
  ) {
    super(KEYWORDS.INVULNERABLE.id, game, source, {
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.INVULNERABLE),
        new UnitEffectModifierMixin(game, {
          getModifier: () => {
            return new InvulnerableUnitModifier(game, this.initialSource, {
              mixins: options?.unitMixins ?? []
            });
          }
        }),
        ...(options?.mixins ?? [])
      ]
    });
  }
}

export class InvulnerableUnitModifier extends Modifier<Unit> {
  constructor(
    game: Game,
    source: AnyCard,
    options: {
      mixins?: ModifierMixin<Unit>[];
      modifierType?: string;
      isRemovable?: boolean;
    } = {}
  ) {
    super(options.modifierType ?? KEYWORDS.INVULNERABLE.id, game, source, {
      name: KEYWORDS.INVULNERABLE.name,
      description: KEYWORDS.INVULNERABLE.description,
      icon: 'icons/keyword-invincible',
      mixins: [
        new UnitInterceptorModifierMixin(game, {
          key: 'damageReceived',
          interceptor() {
            return 0;
          }
        }),
        ...(options.mixins ?? [])
      ]
    });
  }
}
