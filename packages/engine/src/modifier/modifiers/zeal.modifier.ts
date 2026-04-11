import { KEYWORDS } from '../../card/card-keywords';
import type { AnyCard } from '../../card/entities/card.entity';
import type { MinionCard } from '../../card/entities/minion-card.entity';
import { Game } from '../../game/game';
import type { Unit } from '../../unit/unit.entity';
import { TogglableModifierMixin } from '../mixins/togglable.mixin';
import { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';
import { UnitEffectModifierMixin } from '../mixins/unit-effect.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { Interceptable } from '../../utils/interceptable';
import { GameEventModifierMixin } from '../mixins/game-event.mixin';
import { GAME_EVENTS } from '../../game/game.events';

export class ZealModifier extends Modifier<MinionCard> {
  constructor(
    modifierType: string,
    game: Game,
    source: AnyCard,
    options: {
      mixins?: ModifierMixin<MinionCard>[];
      unitMixins: ModifierMixin<Unit>[];
    }
  ) {
    super(modifierType, game, source, {
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.ZEAL),
        new UnitEffectModifierMixin(game, {
          getModifier: () =>
            new ZealUnitModifier(game, source, {
              mixins: options.unitMixins
            })
        }),
        ...(options.mixins ?? [])
      ]
    });
  }
}

export class ZealUnitModifier extends Modifier<Unit> {
  private _isZealed = new Interceptable<boolean>();

  private adjacentMinionHasAttackedThisTurn = false;

  get isZealed() {
    return this._isZealed.getValue(this.adjacentMinionHasAttackedThisTurn, {});
  }

  constructor(game: Game, source: AnyCard, options: { mixins?: ModifierMixin<Unit>[] }) {
    super(KEYWORDS.ZEAL.id, game, source, {
      name: KEYWORDS.ZEAL.name,
      description: KEYWORDS.ZEAL.description,
      icon: 'icons/keyword-zeal',
      mixins: [
        new TogglableModifierMixin(game, () => this.isZealed),
        new GameEventModifierMixin(game, {
          eventName: GAME_EVENTS.UNIT_AFTER_ATTACK,
          persistWhileDisabled: true,
          filter: event =>
            !!event?.data.unit.isAlly(this.target) &&
            this.target.adjacentUnits.some(unit => unit.equals(event.data.unit)),
          handler: () => {
            this.adjacentMinionHasAttackedThisTurn = true;
          }
        }),
        new GameEventModifierMixin(game, {
          eventName: GAME_EVENTS.TURN_END,
          persistWhileDisabled: true,
          handler: () => {
            this.adjacentMinionHasAttackedThisTurn = false;
          }
        }),
        ...(options?.mixins ?? [])
      ]
    });
  }

  addIsZealedInterceptor(interceptor: (value: boolean) => boolean) {
    this._isZealed.add(interceptor);
    return () => this.removeIsZealedInterceptor(interceptor);
  }

  removeIsZealedInterceptor(interceptor: (value: boolean) => boolean) {
    this._isZealed.remove(interceptor);
  }
}

export class IsZealedModifierMixin extends ModifierMixin<Unit> {
  constructor(
    game: Game,
    private readonly interceptor: (value: boolean) => boolean
  ) {
    super(game);
  }

  onApplied(target: Unit): void {
    const zealModifier = target.modifiers.get(ZealUnitModifier);
    if (zealModifier) {
      zealModifier.addIsZealedInterceptor(this.interceptor);
    }
  }

  onRemoved(target: Unit): void {
    const zealModifier = target.modifiers.get(ZealUnitModifier);
    if (zealModifier) {
      zealModifier.removeIsZealedInterceptor(this.interceptor);
    }
  }

  onReapplied(): void {}
}
