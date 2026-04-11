import type { AnyCard } from '../../card/entities/card.entity';
import type { MinionCard } from '../../card/entities/minion-card.entity';
import type { Game } from '../../game/game';
import { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';
import { KEYWORDS } from '../../card/card-keywords';
import { UnitEffectModifierMixin } from '../mixins/unit-effect.mixin';
import { Unit } from '../../unit/unit.entity';
import { UnitInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { Interceptable } from '../../utils/interceptable';
import { GameEventModifierMixin } from '../mixins/game-event.mixin';
import { GAME_EVENTS } from '../../game/game.events';
import { BackstabEvent } from '../modifier.special-events';
import { UNIT_EVENTS } from '../../unit/unit.enums';
import { UnitEffectTriggeredEvent } from '../../unit/unit-events';

export class BackstabModifier<T extends MinionCard> extends Modifier<T> {
  constructor(
    game: Game,
    source: AnyCard,
    options: {
      mixins?: ModifierMixin<T>[];
      damageBonus: number;
      unitMixins?: ModifierMixin<Unit>[];
    }
  ) {
    super(KEYWORDS.BACKSTAB.id, game, source, {
      name: KEYWORDS.BACKSTAB.name,
      description: KEYWORDS.BACKSTAB.description,
      icon: 'icons/keyword-on-attack',
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.BACKSTAB),
        new UnitEffectModifierMixin(game, {
          getModifier: () =>
            new BackstabUnitModifier(game, source, {
              damageBonus: options.damageBonus,
              mixins: options.unitMixins ?? []
            })
        }),
        ...(options?.mixins ?? [])
      ]
    });
  }
}

export class BackstabUnitModifier extends Modifier<Unit> {
  private backstabAmount = new Interceptable<number, BackstabUnitModifier>();

  private _isBackstabbing = false;

  constructor(
    game: Game,
    source: AnyCard,
    private options: {
      mixins?: ModifierMixin<Unit>[];
      modifierType?: string;
      damageBonus: number;
    }
  ) {
    super(options.modifierType ?? KEYWORDS.BACKSTAB.id, game, source, {
      name: KEYWORDS.BACKSTAB.name,
      description: KEYWORDS.BACKSTAB.description,
      icon: 'icons/keyword-backstab',
      mixins: [
        new GameEventModifierMixin(game, {
          eventName: GAME_EVENTS.UNIT_BEFORE_ATTACK,
          filter: event => {
            if (!event) return false;

            return (
              event.data.target instanceof Unit &&
              event.data.unit.equals(this.target) &&
              event.data.target.remainingHp < event.data.target.maxHp
            );
          },
          handler: async () => {
            await this.game.emit(
              UNIT_EVENTS.UNIT_EFFECT_TRIGGERED,
              new UnitEffectTriggeredEvent({ unit: this.target })
            );
            console.log('is backstabbing');
            this._isBackstabbing = true;
          }
        }),
        new GameEventModifierMixin(game, {
          eventName: GAME_EVENTS.UNIT_AFTER_ATTACK,
          filter: event => {
            if (!event) return false;
            return event.data.unit.equals(this.target) && this.isBackstabbing;
          },
          handler: async event => {
            await this.game.emit(
              GAME_EVENTS.MODIFIER_BACKSTAB,
              new BackstabEvent({
                unit: event!.data.unit,
                target: event!.data.target as Unit,
                amount: this.backstabAmount.getValue(this.options.damageBonus, this)
              })
            );
          }
        }),
        new GameEventModifierMixin(game, {
          eventName: GAME_EVENTS.UNIT_AFTER_COMBAT,
          filter: event => {
            if (!event) return false;
            return event.data.unit.equals(this.target);
          },
          handler: () => {
            this._isBackstabbing = false;
          }
        }),
        new UnitInterceptorModifierMixin(game, {
          key: 'damageDealt',
          interceptor: value => {
            if (!this.isBackstabbing) return value;
            return value + this.backstabAmount.getValue(this.options.damageBonus, this);
          }
        }),
        new UnitInterceptorModifierMixin(game, {
          key: 'canBeCounterattackTarget',
          interceptor: value => {
            if (!this.isBackstabbing) return value;
            return false;
          }
        }),
        ...(options.mixins ?? [])
      ]
    });
  }

  get isBackstabbing() {
    return this._isBackstabbing;
  }

  addBackstabAmountInterceptor(interceptor: (value: number) => number) {
    this.backstabAmount.add(interceptor);
    return () => this.removeBackstabAmountInterceptor(interceptor);
  }

  removeBackstabAmountInterceptor(interceptor: (value: number) => number) {
    this.backstabAmount.remove(interceptor);
  }
}

export class BackstabAmountModifierMixin extends ModifierMixin<Unit> {
  constructor(
    game: Game,
    private readonly interceptor: (value: number) => number
  ) {
    super(game);
  }

  onApplied(target: Unit): void {
    const backstabModifier = target.modifiers.get(BackstabUnitModifier);
    if (backstabModifier) {
      backstabModifier.addBackstabAmountInterceptor(this.interceptor);
    }
  }

  onRemoved(target: Unit): void {
    const backstabModifier = target.modifiers.get(BackstabUnitModifier);
    if (backstabModifier) {
      backstabModifier.removeBackstabAmountInterceptor(this.interceptor);
    }
  }

  onReapplied(): void {}
}
