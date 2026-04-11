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
import { TARGETING_TYPE } from '../../targeting/targeting-strategy';
import { TogglableModifierMixin } from '../mixins/togglable.mixin';
import { CleaveAOEShape } from '../../aoe/cleave.aoe-shape';

export class CleaveCardModifier<T extends MinionCard> extends Modifier<T> {
  constructor(game: Game, source: AnyCard, options?: { mixins: ModifierMixin<T>[] }) {
    super(KEYWORDS.CLEAVE.id, game, source, {
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.CLEAVE),
        new UnitEffectModifierMixin(game, {
          getModifier: () =>
            new CleaveUnitModifier(game, this.initialSource, { mixins: [] })
        }),
        ...(options?.mixins ?? [])
      ]
    });
  }
}

export class CleaveUnitModifier extends Modifier<Unit> {
  constructor(
    game: Game,
    source: AnyCard,
    options: {
      mixins?: ModifierMixin<Unit>[];
      modifierType?: string;
      isRemovable?: boolean;
    } = {}
  ) {
    super(options.modifierType ?? KEYWORDS.CLEAVE.id, game, source, {
      name: KEYWORDS.CLEAVE.name,
      description: KEYWORDS.CLEAVE.description,
      icon: 'icons/keyword-cleave',
      mixins: [
        new UnitInterceptorModifierMixin(game, {
          key: 'attackAOEShape',
          interceptor: () => new CleaveAOEShape(TARGETING_TYPE.UNIT, {})
        }),
        new TogglableModifierMixin(game, () => this.target.isOnFrontRow),
        ...(options.mixins ?? [])
      ]
    });
  }
}
