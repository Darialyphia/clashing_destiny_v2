import { TypedSerializableEvent } from '../../utils/typed-emitter';
import type { Ability } from '../entities/ability.entity';
import type { AnyCard } from '../entities/card.entity';

export const ABILITY_EVENTS = {
  ABILITY_BEFORE_USE: 'ability:before-use',
  ABILITY_AFTER_USE: 'ability:after-use'
} as const;

export class AbilityBeforeUseEvent extends TypedSerializableEvent<
  { ability: Ability<AnyCard>; card: AnyCard },
  { card: string; ability: string }
> {
  serialize() {
    return {
      card: this.data.card.id,
      ability: this.data.ability.abilityId
    };
  }
}

export class AbilityAfterUseEvent extends TypedSerializableEvent<
  { ability: Ability<AnyCard>; card: AnyCard },
  { card: string; ability: string }
> {
  serialize() {
    return {
      card: this.data.card.id,
      ability: this.data.ability.abilityId
    };
  }
}

export type AbilityEventMap = {
  [ABILITY_EVENTS.ABILITY_BEFORE_USE]: AbilityBeforeUseEvent;
  [ABILITY_EVENTS.ABILITY_AFTER_USE]: AbilityAfterUseEvent;
};
