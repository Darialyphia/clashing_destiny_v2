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
import { ColumnAOEShape } from '../../aoe/column.aoe-shape';

export class BlastCardModifier<T extends MinionCard> extends Modifier<T> {
  constructor(game: Game, source: AnyCard, options?: { mixins: ModifierMixin<T>[] }) {
    super(KEYWORDS.BLAST.id, game, source, {
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.BLAST),
        new UnitEffectModifierMixin(game, {
          getModifier: () =>
            new BlastUnitModifier(game, this.initialSource, { mixins: [] })
        }),
        ...(options?.mixins ?? [])
      ]
    });
  }
}

export class BlastUnitModifier extends Modifier<Unit> {
  constructor(
    game: Game,
    source: AnyCard,
    options: {
      mixins?: ModifierMixin<Unit>[];
      modifierType?: string;
      isRemovable?: boolean;
    } = {}
  ) {
    super(options.modifierType ?? KEYWORDS.BLAST.id, game, source, {
      name: KEYWORDS.BLAST.name,
      description: KEYWORDS.BLAST.description,
      icon: 'icons/keyword-blast',
      mixins: [
        new UnitInterceptorModifierMixin(game, {
          key: 'attackAOEShape',
          interceptor: () =>
            new ColumnAOEShape(TARGETING_TYPE.ENEMY_UNIT, {
              height: game.boardSystem.height
            })
        }),
        new TogglableModifierMixin(game, () => this.target.isOnFrontRow),
        ...(options.mixins ?? [])
      ]
    });
  }
}
