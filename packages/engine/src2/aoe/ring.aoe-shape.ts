import { type Point } from '@game/shared';
import type { AOEShape } from './aoe-shape';
import type { TargetingType } from './aoe.enums';

export type SerializedRingAOE = {
  type: 'ring';
  targetingType: TargetingType;
  params: {
    override: Point | null;
    includeCenter: boolean;
    includeDiagonals: boolean;
  };
};

type RingAoeShapeOptions = {
  override?: Point;
  includeCenter?: boolean;
  includeDiagonals?: boolean;
};

export class RingAOEShape implements AOEShape<SerializedRingAOE> {
  static fromJSON(type: TargetingType, options: RingAoeShapeOptions): RingAOEShape {
    return new RingAOEShape(type, options);
  }

  readonly type = 'ring' as const;

  constructor(
    readonly targetingType: TargetingType,
    private readonly options: RingAoeShapeOptions
  ) {}

  serialize() {
    return {
      type: this.type,
      targetingType: this.targetingType,
      params: {
        override: this.options.override ?? null,
        includeCenter: this.options.includeCenter ?? false,
        includeDiagonals: this.options.includeDiagonals ?? false
      }
    };
  }

  getArea([point]: [Point]): Point[] {
    const area: Point[] = [];
    if (!point) return area;
    const center = this.options.override ?? point;
    if (this.options.includeCenter) area.push(center);

    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;
        if (!this.options.includeDiagonals && Math.abs(dx) === Math.abs(dy)) continue;

        const newPoint = { x: center.x + dx, y: center.y + dy };
        area.push(newPoint);
      }
    }
    return area;
  }
}
