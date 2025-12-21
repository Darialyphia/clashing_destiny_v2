import { TypedSerializableEvent } from '../../utils/typed-emitter';
import type { AbilityOwner } from '../entities/ability.entity';

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
