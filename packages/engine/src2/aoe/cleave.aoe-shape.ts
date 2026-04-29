import type { EmptyObject, Nullable, Point } from '@game/shared';
import type { AOEShape } from './aoe-shape';
import type { TargetingType } from './aoe.enums';

export type SerializedCleaveAOE = {
  type: 'cleave';
  targetingType: TargetingType;
  params: EmptyObject;
};

type CleaveAoeShapeOptions = {
  override?: Nullable<Point>;
};
export class CleaveAOEShape implements AOEShape<SerializedCleaveAOE> {
  static fromJSON(type: TargetingType, options?: CleaveAoeShapeOptions): CleaveAOEShape {
    return new CleaveAOEShape(type, options ?? {});
  }

  readonly type = 'cleave' as const;

  constructor(
    readonly targetingType: TargetingType,
    private readonly options: CleaveAoeShapeOptions
  ) {}

  serialize() {
    return {
      type: this.type,
      targetingType: this.targetingType,
      params: {}
    };
  }

  getArea([point]: [Point]): Point[] {
    const area = this.options.override ?? point;
    if (!area) return [];

    return [area, { x: area.x - 1, y: area.y }, { x: area.x + 1, y: area.y }];
  }
}
