import type { JSONObject, Point } from '@game/shared';
import type { AOEShape } from './aoe-shape';
import type { TargetingType } from './aoe.enums';
import { makeAoeShape, type AOEType } from './aoe-shape.factory';

type CompositeAOEShapeOptions = {
  shapes: Array<{ type: AOEType; params: JSONObject; pointIndices: number[] }>;
};

export type SerializedCompositeAOE = {
  type: 'composite';
  targetingType: TargetingType;
  params: CompositeAOEShapeOptions;
};

export class CompositeAOEShape implements AOEShape<SerializedCompositeAOE> {
  static fromJSON(
    type: TargetingType,
    options: CompositeAOEShapeOptions
  ): CompositeAOEShape {
    return new CompositeAOEShape(type, options);
  }

  readonly type = 'composite' as const;

  constructor(
    readonly targetingType: TargetingType,
    private readonly options: CompositeAOEShapeOptions
  ) {}

  serialize() {
    return {
      type: this.type,
      targetingType: this.targetingType,
      params: this.options
    };
  }

  getArea(points: Point[]): Point[] {
    const area = this.options.shapes.map(shapeDef => {
      const shape = makeAoeShape(shapeDef.type, this.targetingType, shapeDef.params);
      return shape.getArea(shapeDef.pointIndices.map(i => points[i]));
    });

    const flatArea = area.flat();

    // Remove duplicate points by using a Set with stringified coordinates
    const seen = new Set<string>();
    return flatArea.filter(point => {
      const key = `${point.x},${point.y}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }
}
