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

export class CelerityCardModifier<T extends MinionCard> extends Modifier<T> {
  constructor(game: Game, source: AnyCard, options?: { mixins: ModifierMixin<T>[] }) {
    super(KEYWORDS.CELERITY.id, game, source, {
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.CELERITY),
        new UnitEffectModifierMixin(game, {
          getModifier: () =>
            new CelerityUnitModifier(game, this.initialSource, { mixins: [] })
        }),
        ...(options?.mixins ?? [])
      ]
    });
  }
}

export class CelerityUnitModifier extends Modifier<Unit> {
  constructor(
    game: Game,
    source: AnyCard,
    options: {
      mixins?: ModifierMixin<Unit>[];
      modifierType?: string;
      isRemovable?: boolean;
    } = {}
  ) {
    super(options.modifierType ?? KEYWORDS.CELERITY.id, game, source, {
      name: KEYWORDS.CELERITY.name,
      description: KEYWORDS.CELERITY.description,
      icon: 'icons/keyword-celerity',
      mixins: [
        new UnitInterceptorModifierMixin(game, {
          key: 'shouldExhaustAfterMoving',
          interceptor: () => false
        }),
        new UnitInterceptorModifierMixin(game, {
          key: 'shouldSwitchInitiativeafterMoving',
          interceptor: () => false
        }),
        ...(options.mixins ?? [])
      ]
    });
  }
}
