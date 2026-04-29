import type { JSONObject, Point, Serializable } from '@game/shared';
import type { TargetingType } from './aoe.enums';
import type { AOEType } from './aoe-shape.factory';

export type SerializedAOE = {
  type: AOEType;
  targetingType: TargetingType;
  params: JSONObject;
};

export type AOEShape<T extends SerializedAOE> = {
  type: string;
  targetingType: TargetingType;
  getArea(points: Point[]): Point[];
} & Serializable<T>;

export type GenericAOEShape = AOEShape<SerializedAOE>;
