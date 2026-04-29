import type { Game } from '../..';
import { KEYWORDS } from '../../card/card-keywords';
import type { AnyCard } from '../../card/entities/card.entity';
import type { MinionCard } from '../../card/entities/minion-card.entity';
import type { Unit } from '../../unit/unit.entity';
import { UnitInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import { UnitEffectModifierMixin } from '../mixins/unit-effect.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class StructureModifier extends Modifier<MinionCard> {
  constructor(
    game: Game,
    source: AnyCard,
    options: { mixins?: ModifierMixin<MinionCard>[] }
  ) {
    super(KEYWORDS.STRUCTURE.id, game, source, {
      mixins: [
        new UnitEffectModifierMixin(game, {
          getModifier: () =>
            new StructureUnitModifier(game, source, {
              mixins: []
            }),
          ...(options?.mixins ?? [])
        })
      ]
    });
  }
}

export class StructureUnitModifier extends Modifier<Unit> {
  constructor(
    game: Game,
    source: AnyCard,
    options: {
      mixins?: ModifierMixin<Unit>[];
      modifierType?: string;
    }
  ) {
    super(options.modifierType ?? KEYWORDS.STRUCTURE.id, game, source, {
      name: KEYWORDS.STRUCTURE.name,
      description: KEYWORDS.STRUCTURE.description,
      icon: 'icons/keyword-structure',
      mixins: [
        new UnitInterceptorModifierMixin(game, {
          key: 'canMove',
          interceptor: () => false
        }),
        new UnitInterceptorModifierMixin(game, {
          key: 'canAttack',
          interceptor: () => false
        }),
        new UnitInterceptorModifierMixin(game, {
          key: 'canCounterAttack',
          interceptor: () => false
        }),
        new UnitInterceptorModifierMixin(game, {
          key: 'atk',
          interceptor: () => 0
        }),
        ...(options.mixins ?? [])
      ]
    });
  }

  get nearbyEmptySpaces() {
    return this.game.boardSystem
      .getNeighbors(this.target.position)
      .filter(space => !space.isOccupied);
  }
}
