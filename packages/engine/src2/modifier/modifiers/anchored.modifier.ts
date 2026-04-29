import type { AnyCard } from '../../card/entities/card.entity';
import type { MinionCard } from '../../card/entities/minion-card.entity';
import type { Game } from '../../game/game';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';
import { KEYWORDS } from '../../card/card-keywords';
import { UnitEffectModifierMixin } from '../mixins/unit-effect.mixin';
import type { Unit } from '../../unit/unit.entity';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { UnitInterceptorModifierMixin } from '../mixins/interceptor.mixin';

export class AnchoredCardModifier<T extends MinionCard> extends Modifier<T> {
  constructor(game: Game, source: AnyCard, options?: { mixins: ModifierMixin<T>[] }) {
    super(KEYWORDS.ANCHORED.id, game, source, {
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.ANCHORED),
        new UnitEffectModifierMixin(game, {
          getModifier: () => {
            return new AnchoredUnitModifier(game, this.initialSource, { mixins: [] });
          }
        }),
        ...(options?.mixins ?? [])
      ]
    });
  }
}

export class AnchoredUnitModifier extends Modifier<Unit> {
  constructor(
    game: Game,
    source: AnyCard,
    options: {
      mixins?: ModifierMixin<Unit>[];
      modifierType?: string;
      isRemovable?: boolean;
    } = {}
  ) {
    super(options.modifierType ?? KEYWORDS.ANCHORED.id, game, source, {
      name: KEYWORDS.ANCHORED.name,
      description: KEYWORDS.ANCHORED.description,
      icon: 'icons/keyword-locked',
      mixins: [
        new UnitInterceptorModifierMixin(game, {
          key: 'canMove',
          interceptor: () => {
            return false;
          }
        }),
        new UnitInterceptorModifierMixin(game, {
          key: 'canBeMoved',
          interceptor: () => {
            return false;
          }
        }),
        ...(options.mixins ?? [])
      ]
    });
  }
}
