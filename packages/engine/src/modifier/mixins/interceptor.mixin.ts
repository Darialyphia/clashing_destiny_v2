import type { Modifier, ModifierTarget } from '../modifier.entity';
import { ModifierMixin } from '../modifier-mixin';
import type { Game } from '../../game/game';
import type {
  inferInterceptorValue,
  inferInterceptorCtx,
  Interceptable
} from '../../utils/interceptable';
import type {
  MinionCard,
  MinionCardInterceptors
} from '../../card/entities/minion-card.entity';
import type {
  SpellCard,
  SpellCardInterceptors
} from '../../card/entities/spell-card.entity';
import type {
  ArtifactCard,
  ArtifactCardInterceptors
} from '../../card/entities/artifact-card.entity';
import type { Unit, UnitInterceptors } from '../../unit/unit.entity';
import type {
  PlayerArtifact,
  PlayerArtifactInterceptor
} from '../../player/player-artifact.entity';
import type { Player, PlayerInterceptor } from '../../player/player.entity';
import type { Ability, AbilityInterceptor } from '../../card/entities/ability.entity';

type InterceptorMap = Record<string, Interceptable<any, any>>;
export class InterceptorModifierMixin<
  TInterceptorMap extends InterceptorMap,
  TKey extends keyof TInterceptorMap,
  TTarget extends ModifierTarget
> extends ModifierMixin<TTarget> {
  private modifier!: Modifier<TTarget>;

  constructor(
    game: Game,
    private options: {
      key: TKey;
      priority?: number;
      interceptor: (
        value: inferInterceptorValue<TInterceptorMap[TKey]>,
        ctx: inferInterceptorCtx<TInterceptorMap[TKey]>,
        modifier: Modifier<TTarget>
      ) => inferInterceptorValue<TInterceptorMap[TKey]>;
    }
  ) {
    super(game);
    this.interceptor = this.interceptor.bind(this);
  }

  interceptor(
    value: inferInterceptorValue<TInterceptorMap[TKey]>,
    ctx: inferInterceptorCtx<TInterceptorMap[TKey]>
  ) {
    return this.options.interceptor(value, ctx, this.modifier);
  }

  onApplied(target: TTarget, modifier: Modifier<TTarget>): void {
    this.modifier = modifier;
    //@ts-expect-error
    target.addInterceptor(
      this.options.key,
      this.interceptor as any,
      this.options.priority
    );
  }

  onRemoved(target: TTarget): void {
    if (!target) return;
    //@ts-expect-error
    target.removeInterceptor(
      this.options.key,
      this.interceptor as any,
      this.options.priority
    );
  }

  onReapplied() {}
}

type CardInterceptors =
  | MinionCardInterceptors
  | SpellCardInterceptors
  | ArtifactCardInterceptors;
export class CardInterceptorModifierMixin<
  TKey extends keyof CardInterceptors
> extends InterceptorModifierMixin<
  CardInterceptors,
  TKey,
  MinionCard | SpellCard | ArtifactCard
> {}

export class MinionInterceptorModifierMixin<
  TKey extends keyof MinionCardInterceptors
> extends InterceptorModifierMixin<MinionCardInterceptors, TKey, MinionCard> {}

export class UnitInterceptorModifierMixin<
  TKey extends keyof UnitInterceptors
> extends InterceptorModifierMixin<UnitInterceptors, TKey, Unit> {}

export class PlayerArtifactInterceptorModifierMixin<
  TKey extends keyof PlayerArtifactInterceptor
> extends InterceptorModifierMixin<PlayerArtifactInterceptor, TKey, PlayerArtifact> {}

export class ArtifactInterceptorModifierMixin<
  TKey extends keyof ArtifactCardInterceptors
> extends InterceptorModifierMixin<ArtifactCardInterceptors, TKey, ArtifactCard> {}

export class SpellInterceptorModifierMixin<
  TKey extends keyof SpellCardInterceptors
> extends InterceptorModifierMixin<SpellCardInterceptors, TKey, SpellCard> {}

export class PlayerInterceptorModifierMixin<
  TKey extends keyof PlayerInterceptor
> extends InterceptorModifierMixin<PlayerInterceptor, TKey, Player> {}

export class ArtifactAbilityInterceptorModifierMixin<
  TKey extends keyof AbilityInterceptor
> extends InterceptorModifierMixin<AbilityInterceptor, TKey, Ability<ArtifactCard>> {}
