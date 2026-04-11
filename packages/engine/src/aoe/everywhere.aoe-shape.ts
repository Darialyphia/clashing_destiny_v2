import type { EmptyObject, Point } from '@game/shared';
import type { AOEShape } from './aoe-shape';
import type { TargetingType } from './aoe.enums';

export type SerializedEverywhereAOE = {
  type: 'everywhere';
  targetingType: TargetingType;
  params: { width: number; height: number };
};

type EverywhereAOEShapeOptions = { width: number; height: number };
export class EverywhereAOEShape implements AOEShape<SerializedEverywhereAOE> {
  static fromJSON(
    type: TargetingType,
    options: EverywhereAOEShapeOptions
  ): EverywhereAOEShape {
    return new EverywhereAOEShape(type, options);
  }

  readonly type = 'everywhere' as const;
  constructor(
    readonly targetingType: TargetingType,
    private readonly options: EverywhereAOEShapeOptions
  ) {}

  serialize() {
    return {
      type: this.type,
      targetingType: this.targetingType,
      params: {
        width: this.options.width,
        height: this.options.height
      }
    };
  }

  getArea([point]: [Point]): Point[] {
    const area: Point[] = [];
    if (!point) return area;

    for (let x = 0; x < this.options.width; x++) {
      for (let y = 0; y < this.options.height; y++) {
        area.push({ x, y });
      }
    }

    return area;
  }
}
