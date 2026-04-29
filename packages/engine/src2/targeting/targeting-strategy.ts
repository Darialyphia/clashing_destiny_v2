import { isDefined, type Point, type Values } from '@game/shared';
import { match } from 'ts-pattern';
import type { Player } from '../player/player.entity';
import type { Game } from '../game/game';

export type TargetingStrategy = {
  isWithinRange(point: Point): boolean;
  canTargetAt(point: Point): boolean;
};

export const TARGETING_TYPE = {
  EMPTY: 'empty',
  ALLY_UNIT: 'ally_unit',
  ENEMY_UNIT: 'enemy_unit',
  UNIT: 'unit',
  ANYWHERE: 'anywhere'
} as const;

export type TargetingType = Values<typeof TARGETING_TYPE>;
export type NonEmptyTargetingType = Exclude<
  TargetingType,
  (typeof TARGETING_TYPE)['EMPTY'] | (typeof TARGETING_TYPE)['ANYWHERE']
>;

export const isValidTargetingType = (
  game: Game,
  point: Point,
  player: Player,
  type: TargetingType
) => {
  const unit = game.unitSystem.getUnitAt(point);

  return !!match(type)
    .with(TARGETING_TYPE.ANYWHERE, () => true)
    .with(TARGETING_TYPE.EMPTY, () => !unit)
    .with(TARGETING_TYPE.ALLY_UNIT, () => unit?.player.equals(player))
    .with(TARGETING_TYPE.ENEMY_UNIT, () => !unit?.player.equals(player))
    .with(TARGETING_TYPE.UNIT, () => isDefined(unit))
    .exhaustive();
};
