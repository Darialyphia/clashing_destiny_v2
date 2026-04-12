import type { Point, Vec2 } from '@game/shared';
import { TypedSerializableEvent } from '../utils/typed-emitter';
import type { Unit } from './unit.entity';
import type { UNIT_EVENTS } from './unit.enums';
import type { Damage } from '../utils/damage';
import type { AnyCard } from '../card/entities/card.entity';
import type { Player } from '../player/player.entity';

export class UnitBeforeMoveEvent extends TypedSerializableEvent<
  { unit: Unit; position: Vec2 },
  { unit: string; position: Point }
> {
  serialize() {
    return {
      unit: this.data.unit.id,
      position: this.data.position.serialize()
    };
  }
}

export class UnitAfterMoveEvent extends TypedSerializableEvent<
  { unit: Unit; position: Vec2; previousPosition: Vec2 },
  { unit: string; position: Point; previousPosition: Point }
> {
  serialize() {
    return {
      unit: this.data.unit.id,
      position: this.data.position.serialize(),
      previousPosition: this.data.previousPosition.serialize()
    };
  }
}

export class UnitBeforeDestroyEvent extends TypedSerializableEvent<
  { source: AnyCard; unit: Unit },
  { source: string; unit: string }
> {
  serialize() {
    return {
      source: this.data.source.id,
      unit: this.data.unit.id
    };
  }
}

export class UnitAfterDestroyEvent extends TypedSerializableEvent<
  { unit: Unit; source: AnyCard; destroyedAt: Vec2 },
  { unit: string; source: string; destroyedAt: Point }
> {
  serialize() {
    return {
      unit: this.data.unit.id,
      source: this.data.source.id,
      destroyedAt: this.data.destroyedAt.serialize()
    };
  }
}

export class UnitBeforeHealEvent extends TypedSerializableEvent<
  { unit: Unit; amount: number; source: AnyCard },
  { unit: string; amount: number; source: string }
> {
  serialize() {
    return {
      unit: this.data.unit.id,
      amount: this.data.amount,
      source: this.data.source.id
    };
  }
}

export class UnitAfterHealEvent extends TypedSerializableEvent<
  { unit: Unit; amount: number; source: AnyCard },
  { unit: string; amount: number; source: string }
> {
  serialize() {
    return {
      unit: this.data.unit.id,
      amount: this.data.amount,
      source: this.data.source.id
    };
  }
}

export class UnitBeforeBounceEvent extends TypedSerializableEvent<
  { unit: Unit },
  { unit: string }
> {
  serialize() {
    return {
      unit: this.data.unit.id
    };
  }
}
export class UnitAfterBounceEvent extends TypedSerializableEvent<
  { unit: Unit; didBounce: boolean },
  { unit: string; didBounce: boolean }
> {
  serialize() {
    return {
      unit: this.data.unit.id,
      didBounce: this.data.didBounce
    };
  }
}

export class UnitEffectTriggeredEvent extends TypedSerializableEvent<
  { unit: Unit },
  { unit: string }
> {
  serialize() {
    return {
      unit: this.data.unit.id
    };
  }
}

export type UnitEventMap = {
  [UNIT_EVENTS.UNIT_BEFORE_MOVE]: UnitBeforeMoveEvent;
  [UNIT_EVENTS.UNIT_AFTER_MOVE]: UnitAfterMoveEvent;
  [UNIT_EVENTS.UNIT_BEFORE_DESTROY]: UnitBeforeDestroyEvent;
  [UNIT_EVENTS.UNIT_AFTER_DESTROY]: UnitAfterDestroyEvent;
  [UNIT_EVENTS.UNIT_BEFORE_TELEPORT]: UnitBeforeMoveEvent;
  [UNIT_EVENTS.UNIT_AFTER_TELEPORT]: UnitAfterMoveEvent;
  [UNIT_EVENTS.UNIT_BEFORE_HEAL]: UnitBeforeHealEvent;
  [UNIT_EVENTS.UNIT_AFTER_HEAL]: UnitAfterHealEvent;
  [UNIT_EVENTS.UNIT_BEFORE_BOUNCE]: UnitBeforeBounceEvent;
  [UNIT_EVENTS.UNIT_AFTER_BOUNCE]: UnitAfterBounceEvent;
  [UNIT_EVENTS.UNIT_EFFECT_TRIGGERED]: UnitEffectTriggeredEvent;
};
