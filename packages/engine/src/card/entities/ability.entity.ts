import type { MaybePromise, Serializable } from '@game/shared';
import type { Game } from '../../game/game';
import {
  serializePreResponseTarget,
  type AbilityBlueprint,
  type SerializedAbility,
  type Targets
} from '../card-blueprint';
import { GAME_PHASES, type GamePhase } from '../../game/game.enums';
import type { HeroCard } from './hero.entity';
import type { MinionCard } from './minion.entity';
import { Entity } from '../../entity';
import { Interceptable } from '../../utils/interceptable';
import {
  ABILITY_EVENTS,
  AbilityAfterUseEvent,
  AbilityBeforeUseEvent
} from '../events/ability.events';

export type AbilityOwner = MinionCard | HeroCard;

export type AbilityInterceptors<T extends AbilityOwner> = {
  manaCost: Interceptable<number, Ability<T>>;
};

export class Ability<T extends AbilityOwner>
  extends Entity<AbilityInterceptors<T>>
  implements Serializable<SerializedAbility>
{
  _isSealed = false;

  private targets: Targets | null = null;

  constructor(
    private game: Game,
    readonly card: T,
    public blueprint: AbilityBlueprint<T, any>
  ) {
    super(`${card.id}-${blueprint.id}`, {
      manaCost: new Interceptable()
    });
  }

  get abilityId() {
    return this.blueprint.id;
  }

  get manaCost(): number {
    return this.interceptors.manaCost.getValue(this.blueprint.manaCost, this);
  }

  get canUseDuringChain() {
    // Speed system removed - all abilities can now be used during chain
    return true;
  }

  get canUse() {
    if (this._isSealed) return false;

    const authorizedPhases: GamePhase[] = [GAME_PHASES.MAIN];

    const exhaustCondition = !this.card.isExhausted;
    const timingCondition = this.game.interaction.isInteractive(this.card.player);

    return (
      this.card.player.cardManager.hand.length >= this.manaCost &&
      authorizedPhases.includes(this.game.gamePhaseSystem.getContext().state) &&
      timingCondition &&
      exhaustCondition &&
      this.blueprint.canUse(this.game, this.card)
    );
  }

  private async resolveEffect() {
    await this.game.emit(
      ABILITY_EVENTS.ABILITY_BEFORE_USE,
      new AbilityBeforeUseEvent({ card: this.card, abilityId: this.abilityId })
    );

    await this.blueprint.onResolve(this.game, this.card, this.targets!, this);

    await this.game.emit(
      ABILITY_EVENTS.ABILITY_AFTER_USE,
      new AbilityAfterUseEvent({ card: this.card, abilityId: this.abilityId })
    );
  }

  async use(onResolved?: () => MaybePromise<void>) {
    const targetsResult = await this.blueprint.getTargets(this.game, this.card);
    if (targetsResult.cancelled) return;
    this.targets = targetsResult.result;

    await this.resolveEffect();
    await this.card.exhaust();
    this.targets = null;

    await onResolved?.();
  }

  seal() {
    this._isSealed = true;
  }

  unseal() {
    this._isSealed = false;
  }

  serialize(): SerializedAbility {
    return {
      id: this.id,
      entityType: 'ability',
      abilityId: this.abilityId,
      canUse: this.canUse,
      description: this.blueprint.description,
      label: this.blueprint.label,
      manaCost: this.manaCost,
      isHiddenOnCard: !!this.blueprint.isHiddenOnCard,
      targets: this.targets ? serializePreResponseTarget(this.targets) : null
    };
  }
}
