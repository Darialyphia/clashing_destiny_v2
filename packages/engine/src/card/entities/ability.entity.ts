import type { EmptyObject, MaybePromise, Serializable } from '@game/shared';
import type { Game } from '../../game/game';
import {
  serializePreResponseTarget,
  type AbilityBlueprint,
  type PreResponseTarget,
  type SerializedAbility
} from '../card-blueprint';
import { EFFECT_TYPE, GAME_PHASES, type GamePhase } from '../../game/game.enums';
import type { ArtifactCard } from './artifact.entity';
import type { HeroCard } from './hero.entity';
import type { MinionCard } from './minion.entity';
import { Card } from './card.entity';
import { Entity } from '../../entity';
import { TypedSerializableEvent } from '../../utils/typed-emitter';
import { CARD_SPEED } from '../card.enums';
import type { SigilCard } from './sigil.entity';
import type { SpellCard } from './spell.entity';
import { Interceptable } from '../../utils/interceptable';

export const ABILITY_EVENTS = {
  ABILITY_BEFORE_USE: 'ability.before-use',
  ABILITY_AFTER_USE: 'ability.after-use'
} as const;

export class AbilityBeforeUseEvent extends TypedSerializableEvent<
  { card: AbilityOwner; abilityId: string },
  {
    card: string;
    abilityId: string;
  }
> {
  serialize() {
    return {
      card: this.data.card.id,
      abilityId: this.data.abilityId
    };
  }
}

export class AbilityAfterUseEvent extends TypedSerializableEvent<
  { card: AbilityOwner; abilityId: string },
  {
    card: string;
    abilityId: string;
  }
> {
  serialize() {
    return {
      card: this.data.card.id,
      abilityId: this.data.abilityId
    };
  }
}

export type AbilityEventMap = {
  [ABILITY_EVENTS.ABILITY_BEFORE_USE]: AbilityBeforeUseEvent;
  [ABILITY_EVENTS.ABILITY_AFTER_USE]: AbilityAfterUseEvent;
};

export type AbilityOwner = MinionCard | HeroCard | ArtifactCard | SigilCard | SpellCard;

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

  get speed() {
    return this.blueprint.speed;
  }

  get shouldExhaust() {
    return this.blueprint.shouldExhaust;
  }

  get manaCost(): number {
    return this.interceptors.manaCost.getValue(this.blueprint.manaCost, this);
  }

  get canUse() {
    if (this._isSealed) return false;

    const authorizedPhases: GamePhase[] = [
      GAME_PHASES.MAIN,
      GAME_PHASES.ATTACK,
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

  protected async insertInChainOrExecute(
    targets: PreResponseTarget[],
    onResolved?: () => MaybePromise<void>
  ) {
    const effect = {
      type: EFFECT_TYPE.ABILITY,
      source: this.card,
      targets,
      handler: async () => {
        await this.resolveEffect();
      }
    };

    if (this.speed === CARD_SPEED.BURST) {
      await effect.handler();
      return this.game.inputSystem.askForPlayerInput();
    }

    if (this.game.effectChainSystem.currentChain) {
      await this.game.effectChainSystem.addEffect(effect, this.card.player);
    } else {
      void this.game.effectChainSystem.createChain({
        initialPlayer: this.card.player,
        initialEffect: effect,
        onResolved
      });
    }
  }

  async use(onResolved?: () => MaybePromise<void>) {
    const targets = await this.blueprint.getPreResponseTargets(this.game, this.card);
    this.card.abilityTargets.set(this.blueprint.id, targets);

    if (this.shouldExhaust) {
      await this.card.exhaust();
    }

    await this.insertInChainOrExecute(targets, onResolved);
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
      runeCost: this.blueprint.runeCost,
      speed: this.speed,
      isHiddenOnCard: !!this.blueprint.isHiddenOnCard,
      shouldExhaust: this.shouldExhaust,
      targets:
        this.card.abilityTargets.get(this.id)?.map(serializePreResponseTarget) ?? []
    };
  }
}
