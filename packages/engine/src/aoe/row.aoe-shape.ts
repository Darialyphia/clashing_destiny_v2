import type { Point } from '@game/shared';
import type { AOEShape } from './aoe-shape';
import type { TargetingType } from './aoe.enums';

export type SerializedRowAOE = {
  type: 'row';
  targetingType: TargetingType;
  params: { width: number; rowOverride: number | null };
};

type RowAoeShapeOptions = {
  width: number;
  height: number;
  rowOverride?: number;
};
export class RowAOEShape implements AOEShape<SerializedRowAOE> {
  static fromJSON(type: TargetingType, options: RowAoeShapeOptions): RowAOEShape {
    return new RowAOEShape(type, options);
  }

  readonly type = 'row' as const;

  constructor(
    readonly targetingType: TargetingType,
    private readonly options: RowAoeShapeOptions
  ) {}

  serialize() {
    return {
      type: this.type,
      targetingType: this.targetingType,
      params: {
        width: this.options.width,
        rowOverride: this.options.rowOverride ?? null
      }
    };
  }

  getArea([point]: [Point]): Point[] {
    const area: Point[] = [];
    const y = this.options.rowOverride ?? point.y;

    for (let x = 0; x < this.options.width; x++) {
      area.push({ x, y });
    }

    return area;
  }
}
