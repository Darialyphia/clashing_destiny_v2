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
import { GameEventModifierMixin } from '../mixins/game-event.mixin';
import { GAME_EVENTS } from '../../game/game.events';
import { isDefined } from '@game/shared';
import { UntilEventModifierMixin } from '../mixins/until-event.mixin';
import { DAMAGE_TYPES } from '../../utils/damage';

export class ElusiveCardModifier<T extends MinionCard> extends Modifier<T> {
  constructor(game: Game, source: AnyCard, options?: { mixins: ModifierMixin<T>[] }) {
    super(KEYWORDS.ELUSIVE.id, game, source, {
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.ELUSIVE),
        new UnitEffectModifierMixin(game, {
          getModifier: () => {
            return new ElusiveUnitModifier(game, this.initialSource, { mixins: [] });
          }
        }),
        ...(options?.mixins ?? [])
      ]
    });
  }
}

export class ElusiveUnitModifier extends Modifier<Unit> {
  private wasAttackedThisTurn = false;

  constructor(
    game: Game,
    source: AnyCard,
    options: {
      mixins?: ModifierMixin<Unit>[];
      modifierType?: string;
      isRemovable?: boolean;
    } = {}
  ) {
    super(options.modifierType ?? KEYWORDS.ELUSIVE.id, game, source, {
      name: KEYWORDS.ELUSIVE.name,
      description: KEYWORDS.ELUSIVE.description,
      icon: 'icons/keyword-elusive',
      mixins: [
        new GameEventModifierMixin(game, {
          eventName: GAME_EVENTS.UNIT_AFTER_ATTACK,
          filter: event => !!event?.data.target.equals(this.target),
          handler: () => {
            this.wasAttackedThisTurn = true;
          }
        }),
        new GameEventModifierMixin(game, {
          eventName: GAME_EVENTS.TURN_START,
          handler: () => {
            this.wasAttackedThisTurn = false;
          }
        }),
        new GameEventModifierMixin(game, {
          eventName: GAME_EVENTS.UNIT_BEFORE_ATTACK,
          filter: event => {
            return !!event?.data.target.equals(this.target) && !this.wasAttackedThisTurn;
          },
          handler: async () => {
            const spaces = [this.target.left, this.target.right].filter(isDefined);

            for (const space of spaces) {
              if (space?.unit) continue;
              this.target.position.x = space.x;

              await this.target.modifiers.add(
                new ElusiveDamageCancelModifier(this.game, this.initialSource)
              );
              break;
            }
          }
        }),

        ...(options.mixins ?? [])
      ]
    });
  }
}

class ElusiveDamageCancelModifier extends Modifier<Unit> {
  constructor(game: Game, source: AnyCard) {
    super('elusive-damage-cancel', game, source, {
      mixins: [
        new UnitInterceptorModifierMixin(game, {
          key: 'damageDealt',
          interceptor: () => {
            return 0;
          }
        }),
        new UnitInterceptorModifierMixin(game, {
          key: 'damageReceived',
          interceptor: (value, ctx) => {
            if (ctx.damage.type === DAMAGE_TYPES.COMBAT) {
              return 0;
            }
            return value;
          }
        }),
        new UntilEventModifierMixin(game, {
          eventName: GAME_EVENTS.UNIT_AFTER_COUNTERATTACK
        })
      ]
    });
  }
}
