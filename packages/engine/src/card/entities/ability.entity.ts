import type { MaybePromise, Serializable } from '@game/shared';
import type { Game } from '../../game/game';
import {
  serializeTargets,
  type AbilityBlueprint,
  type SerializedAbility,
  type Targets
} from '../card-blueprint';
import { EFFECT_TYPE, GAME_PHASES, type GamePhase } from '../../game/game.enums';
import type { HeroCard } from './hero.entity';
import type { MinionCard } from './minion.entity';
import { Entity } from '../../entity';
import { Interceptable } from '../../utils/interceptable';
import {
  ABILITY_EVENTS,
  AbilityAfterUseEvent,
  AbilityBeforeUseEvent
} from '../events/ability.events';
import { nanoid } from 'nanoid';

export type AbilityOwner = MinionCard | HeroCard;

export type AbilityInterceptors<T extends AbilityOwner> = {
  manaCost: Interceptable<number, Ability<T>>;
  shouldCreateChain: Interceptable<boolean, Ability<T>>;
  canUseDuringChain: Interceptable<boolean, Ability<T>>;
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
      manaCost: new Interceptable(),
      shouldCreateChain: new Interceptable(),
      canUseDuringChain: new Interceptable()
    });
  }

  get abilityId() {
    return this.blueprint.id;
  }

  get manaCost(): number {
    return this.interceptors.manaCost.getValue(this.blueprint.manaCost, this);
  }

  get shouldCreateChain(): boolean {
    return this.interceptors.shouldCreateChain.getValue(true, this);
  }

  get canUseDuringChain(): boolean {
    return this.interceptors.canUseDuringChain.getValue(true, this);
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

    this.targets = null;
  }

  protected async insertInChainOrExecute(
    targets: Targets,
    onResolved?: () => MaybePromise<void>
  ) {
    if (this.shouldCreateChain) {
      const effect = {
        id: `effect-${this.game.effectChainSystem.currentChain?.stack.length ?? 0}-${nanoid(4)}`,
        type: EFFECT_TYPE.ABILITY,
        source: this.card,
        targets,
        handler: async () => {
          await this.resolveEffect();
        }
      };

      if (this.game.effectChainSystem.currentChain) {
        await this.game.effectChainSystem.addEffect(effect, this.card.player);
      } else {
        await this.game.effectChainSystem.createChain({
          initialPlayer: this.card.player,
          initialEffect: effect,
          onResolved
        });
      }
    } else {
      await this.resolveEffect();
    }
  }

  async use(onResolved?: () => MaybePromise<void>) {
    const targetsResult = await this.blueprint.getTargets(this.game, this.card);
    if (targetsResult.cancelled) return;
    this.targets = targetsResult.result;

    if (this.blueprint.shoouldExhaust) {
      await this.card.exhaust();
    }

    await this.insertInChainOrExecute(this.targets, onResolved);

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
      targets: this.targets ? serializeTargets(this.targets) : null
    };
  }
}
