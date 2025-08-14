import type { EmptyObject, Serializable } from '@game/shared';
import type { Game } from '../../game/game';
import {
  serializePreResponseTarget,
  type AbilityBlueprint,
  type PreResponseTarget,
  type SerializedAbility
} from '../card-blueprint';
import { GAME_PHASES, type GamePhase } from '../../game/game.enums';
import type { DestinyCard } from './destiny.entity';
import type { ArtifactCard } from './artifact.entity';
import type { HeroCard } from './hero.entity';
import type { MinionCard } from './minion.entity';
import { Card } from './card.entity';
import { Entity } from '../../entity';
import { TypedSerializableEvent } from '../../utils/typed-emitter';

export const ABILITY_EVENTS = {
  ABILITY_BEFORE_USE: 'ability.before-use',
  ABILITY_AFTER_USE: 'ability.after-use'
} as const;

export class AbilityBeforeUseEvent extends TypedSerializableEvent<
  { card: MinionCard | HeroCard | ArtifactCard | DestinyCard; abilityId: string },
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
  { card: MinionCard | HeroCard | ArtifactCard | DestinyCard; abilityId: string },
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

export type AbilityOwner = MinionCard | HeroCard | ArtifactCard | DestinyCard;

export class Ability<T extends AbilityOwner>
  extends Entity<EmptyObject>
  implements Serializable<SerializedAbility>
{
  constructor(
    private game: Game,
    readonly card: T,
    public blueprint: AbilityBlueprint<T, PreResponseTarget>
  ) {
    super(`${card.id}-${blueprint.id}`, {});
  }

  get abilityId() {
    return this.blueprint.id;
  }

  get shouldExhaust() {
    return this.blueprint.shouldExhaust;
  }

  get manaCost() {
    return this.blueprint.manaCost;
  }

  get canUse() {
    const authorizedPhases: GamePhase[] = [
      GAME_PHASES.MAIN,
      GAME_PHASES.ATTACK,
      GAME_PHASES.END
    ];

    const exhaustCondition = this.shouldExhaust ? !this.card.isExhausted : true;

    const timingCondition = this.game.effectChainSystem.currentChain
      ? this.game.effectChainSystem.currentChain.canAddEffect(this.card.player)
      : this.game.gamePhaseSystem.currentPlayer.equals(this.card.player);

    return (
      this.card.player.cardManager.hand.length >= this.manaCost &&
      authorizedPhases.includes(this.game.gamePhaseSystem.getContext().state) &&
      timingCondition &&
      exhaustCondition &&
      this.blueprint.canUse(this.game, this.card)
    );
  }

  async use() {
    const targets = await this.blueprint.getPreResponseTargets(this.game, this.card);
    this.card.abilityTargets.set(this.blueprint.id, targets);

    await this.game.emit(
      ABILITY_EVENTS.ABILITY_BEFORE_USE,
      new AbilityBeforeUseEvent({ card: this.card, abilityId: this.abilityId })
    );

    if (this.shouldExhaust) {
      await this.card.exhaust();
    }

    const effect = {
      source: this.card,
      targets,
      handler: async () => {
        const abilityTargets = this.card.abilityTargets.get(this.blueprint.id)!;
        await this.blueprint.onResolve(this.game, this.card, abilityTargets);
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
    };

    if (this.game.effectChainSystem.currentChain) {
      this.game.effectChainSystem.addEffect(effect, this.card.player);
    } else {
      void this.game.effectChainSystem.createChain(this.card.player, effect);
    }
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
      targets:
        this.card.abilityTargets.get(this.id)?.map(serializePreResponseTarget) ?? []
    };
  }
}
