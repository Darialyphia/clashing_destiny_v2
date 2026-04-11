import type { EmptyObject, Point } from '@game/shared';
import type { AOEShape } from './aoe-shape';
import type { TargetingType } from './aoe.enums';

export type SerializedNoAOE = {
  type: 'noAOE';
  targetingType: TargetingType;
  params: EmptyObject;
};

type NoAOEShapeOptions = EmptyObject;
export class NoAOEShape implements AOEShape<SerializedNoAOE> {
  static fromJSON(type: TargetingType, options?: NoAOEShapeOptions): NoAOEShape {
    return new NoAOEShape(type, options ?? {});
  }

  readonly type = 'noAOE' as const;
  constructor(
    readonly targetingType: TargetingType,
    private readonly options: NoAOEShapeOptions
  ) {}

  serialize() {
    return {
      type: this.type,
      targetingType: this.targetingType,
      params: {}
    };
  }

  getArea(): Point[] {
    return [];
  }
}
