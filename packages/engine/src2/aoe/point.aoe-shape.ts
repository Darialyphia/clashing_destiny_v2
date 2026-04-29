import type { Nullable, Point } from '@game/shared';
import type { AOEShape } from './aoe-shape';
import type { TargetingType } from './aoe.enums';

export type SerializedPointAOE = {
  type: 'point';
  targetingType: TargetingType;
  params: {
    override: Point | null;
  };
};

type PointAoeShapeOptions = {
  override?: Nullable<Point>;
};
export class PointAOEShape implements AOEShape<SerializedPointAOE> {
  static fromJSON(type: TargetingType, options?: PointAoeShapeOptions): PointAOEShape {
    return new PointAOEShape(type, options ?? {});
  }

  readonly type = 'point' as const;

  constructor(
    readonly targetingType: TargetingType,
    private readonly options: PointAoeShapeOptions
  ) {}

  serialize() {
    return {
      type: this.type,
      targetingType: this.targetingType,
      params: {
        override: this.options.override ?? null
      }
    };
  }

  getArea([point]: [Point]): Point[] {
    const area = this.options.override ?? point;
    if (!area) return [];

    return [area];
  }
}
