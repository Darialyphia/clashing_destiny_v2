import type { MaybePromise, Serializable } from '@game/shared';
import type { Game } from '../../game/game';
import {
  serializePreResponseTarget,
  type AbilityBlueprint,
  type PreResponseTarget,
  type SerializedAbility
} from '../card-blueprint';
import { GAME_PHASES, type GamePhase } from '../../game/game.enums';
import type { ArtifactCard } from './artifact.entity';
import type { HeroCard } from './hero.entity';
import type { MinionCard } from './minion.entity';
import { Card } from './card.entity';
import { Entity } from '../../entity';
import type { SpellCard } from './spell.entity';
import { Interceptable } from '../../utils/interceptable';
import {
  ABILITY_EVENTS,
  AbilityAfterUseEvent,
  AbilityBeforeUseEvent
} from '../events/ability.events';

export type AbilityOwner = MinionCard | HeroCard | ArtifactCard | SpellCard;

export type AbilityInterceptors<T extends AbilityOwner> = {
  manaCost: Interceptable<number, Ability<T>>;
};

export class Ability<T extends AbilityOwner>
  extends Entity<AbilityInterceptors<T>>
  implements Serializable<SerializedAbility>
{
  _isSealed = false;

  constructor(
    private game: Game,
    readonly card: T,
    public blueprint: AbilityBlueprint<T, PreResponseTarget>
  ) {
    super(`${card.id}-${blueprint.id}`, {
      manaCost: new Interceptable()
    });
  }

  get abilityId() {
    return this.blueprint.id;
  }

  get shouldExhaust() {
    return this.blueprint.shouldExhaust;
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

    const authorizedPhases: GamePhase[] = [
      GAME_PHASES.MAIN,
      GAME_PHASES.COMBAT,
      GAME_PHASES.END
    ];

    const exhaustCondition = this.shouldExhaust ? !this.card.isExhausted : true;
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
    const abilityTargets = this.card.abilityTargets.get(this.blueprint.id) ?? [];
    await this.blueprint.onResolve(this.game, this.card, abilityTargets, this);
    abilityTargets.forEach(target => {
      if (target instanceof Card) {
        target.clearTargetedBy({ type: 'card', card: this.card });
      }
    });
    this.card.abilityTargets.delete(this.blueprint.id);

    await this.game.emit(
      ABILITY_EVENTS.ABILITY_AFTER_USE,
      new AbilityAfterUseEvent({ card: this.card, abilityId: this.abilityId })
    );
  }

  async use(onResolved?: () => MaybePromise<void>) {
    const targets = await this.blueprint.getPreResponseTargets(this.game, this.card);
    this.card.abilityTargets.set(this.blueprint.id, targets);

    if (this.shouldExhaust) {
      await this.card.exhaust();
    }

    await this.resolveEffect();
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
      name: this.blueprint.label,
      manaCost: this.manaCost,
      isHiddenOnCard: !!this.blueprint.isHiddenOnCard,
      shouldExhaust: this.shouldExhaust,
      targets:
        this.card.abilityTargets.get(this.id)?.map(serializePreResponseTarget) ?? []
    };
  }
}
