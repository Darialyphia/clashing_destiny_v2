import type { Point } from '@game/shared';
import type { AOEShape } from './aoe-shape';
import type { TargetingType } from './aoe.enums';

export type SerializedColumnAOE = {
  type: 'column';
  targetingType: TargetingType;
  params: { height: number; columnOverride: number | null };
};

type ColumnAoeShapeOptions = {
  height: number;
  columnOverride?: number;
};

export class ColumnAOEShape implements AOEShape<SerializedColumnAOE> {
  static fromJSON(type: TargetingType, options: ColumnAoeShapeOptions): ColumnAOEShape {
    return new ColumnAOEShape(type, options);
  }

  readonly type = 'column' as const;

  constructor(
    readonly targetingType: TargetingType,
    private readonly options: ColumnAoeShapeOptions
  ) {}

  serialize() {
    return {
      type: this.type,
      targetingType: this.targetingType,
      params: {
        height: this.options.height,
        columnOverride: this.options.columnOverride ?? null
      }
    };
  }

  getArea([point]: [Point]): Point[] {
    const area: Point[] = [];
    const x = this.options.columnOverride ?? point.x;

    for (let y = 0; y < this.options.height; y++) {
      area.push({ x, y });
    }
    return area;
  }
}
