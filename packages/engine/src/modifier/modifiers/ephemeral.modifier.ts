import type { AnyCard } from '../../card/entities/card.entity';
import type { MinionCard } from '../../card/entities/minion-card.entity';
import type { Game } from '../../game/game';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';
import { KEYWORDS } from '../../card/card-keywords';
import { UnitEffectModifierMixin } from '../mixins/unit-effect.mixin';
import type { Unit } from '../../unit/unit.entity';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { GAME_EVENTS } from '../../game/game.events';
import { GameEventModifierMixin } from '../mixins/game-event.mixin';

export class EphemeralCardModifier<T extends MinionCard> extends Modifier<T> {
  constructor(game: Game, source: AnyCard, options?: { mixins: ModifierMixin<T>[] }) {
    super(KEYWORDS.EPHEMERAL.id, game, source, {
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.EPHEMERAL),
        new UnitEffectModifierMixin(game, {
          getModifier: () =>
            new EphemeralUnitModifier(game, this.initialSource, { mixins: [] })
        }),
        ...(options?.mixins ?? [])
      ]
    });
  }
}

export class EphemeralUnitModifier extends Modifier<Unit> {
  constructor(
    game: Game,
    source: AnyCard,
    options: {
      mixins?: ModifierMixin<Unit>[];
      modifierType?: string;
      isRemovable?: boolean;
    } = {}
  ) {
    super(options.modifierType ?? KEYWORDS.EPHEMERAL.id, game, source, {
      name: KEYWORDS.EPHEMERAL.name,
      description: KEYWORDS.EPHEMERAL.description,
      icon: 'icons/keyword-ephemeral',
      mixins: [
        new GameEventModifierMixin(game, {
          eventName: GAME_EVENTS.TURN_END,
          handler: async () => {
            await this.target.removeFromBoard();
          }
        }),
        ...(options.mixins ?? [])
      ]
    });
  }
}
