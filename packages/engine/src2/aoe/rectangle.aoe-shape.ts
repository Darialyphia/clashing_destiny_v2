import type { Point } from '@game/shared';
import type { AOEShape } from './aoe-shape';
import type { TargetingType } from './aoe.enums';

export type SerializedRectangleAOE = {
  type: 'rectangle';
  targetingType: TargetingType;
  params: { width: number; height: number; topLeftOverride: Point | null };
};

type RectangleAoeShapeOptions = {
  width: number;
  height: number;
  topLeftOverride?: Point;
};
export class RectangleAOEShape implements AOEShape<SerializedRectangleAOE> {
  static fromJSON(
    type: TargetingType,
    options: RectangleAoeShapeOptions
  ): RectangleAOEShape {
    return new RectangleAOEShape(type, options);
  }

  readonly type = 'rectangle' as const;

  constructor(
    readonly targetingType: TargetingType,
    private readonly options: RectangleAoeShapeOptions
  ) {}

  serialize() {
    return {
      type: this.type,
      targetingType: this.targetingType,
      params: {
        width: this.options.width,
        height: this.options.height,
        topLeftOverride: this.options.topLeftOverride ?? null
      }
    };
  }

  getArea([point]: [Point]): Point[] {
    const area: Point[] = [];
    if (!point) return area;
    const topLeft = this.options.topLeftOverride ?? point;
    for (let dx = 0; dx < this.options.width; dx++) {
      for (let dy = 0; dy < this.options.height; dy++) {
        area.push({ x: topLeft.x + dx, y: topLeft.y + dy });
      }
    }

    return area;
  }
}
