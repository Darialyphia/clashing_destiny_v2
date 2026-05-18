import { isDefined, type Point, type Values } from '@game/shared';
import { match } from 'ts-pattern';
import type { Player } from '../player/player.entity';
import type { Game } from '../game/game';
import { isMinion, isTrap } from '../card/card-utils';

export type SpaceTargetingStrategy = {
  canTargetAt(point: Point): boolean;
};

export const SPACE_TARGETING_TYPE = {
  ANYWHERE: 'anywhere',
  EMPTY: 'empty',

  CARD: 'card',
  ALLY_CARD: 'ally_card',
  ENEMY_CARD: 'enemy_card',

  MINION: 'minion',
  ALLY_MINION: 'ally_minion',
  ENEMY_MINION: 'enemy_minion',

  TRAP: 'trap',
  ALLY_TRAP: 'ally_trap',
  ENEMY_TRAP: 'enemy_trap'
} as const;

export type SpaceTargetingType = Values<typeof SPACE_TARGETING_TYPE>;
export type NonEmptySpaceTargetingType = Exclude<
  SpaceTargetingType,
  (typeof SPACE_TARGETING_TYPE)['EMPTY'] | (typeof SPACE_TARGETING_TYPE)['ANYWHERE']
>;

export const isValidSpaceTargetingType = (
  game: Game,
  point: Point,
  player: Player,
  type: SpaceTargetingType
) => {
  const space = game.boardSystem.getSpaceAt(point);

  return !!match(type)
    .with(SPACE_TARGETING_TYPE.ANYWHERE, () => true)
    .with(SPACE_TARGETING_TYPE.EMPTY, () => !space)
    .with(SPACE_TARGETING_TYPE.CARD, () => isDefined(space?.occupant))
    .with(SPACE_TARGETING_TYPE.ENEMY_CARD, () => !space?.occupant?.player.equals(player))
    .with(SPACE_TARGETING_TYPE.ALLY_CARD, () => space?.occupant?.player.equals(player))
    .with(
      SPACE_TARGETING_TYPE.MINION,
      () => isDefined(space?.occupant) && isMinion(space.occupant)
    )
    .with(
      SPACE_TARGETING_TYPE.ENEMY_MINION,
      () =>
        isDefined(space?.occupant) &&
        isMinion(space.occupant) &&
        !space.occupant.player.equals(player)
    )
    .with(
      SPACE_TARGETING_TYPE.ALLY_MINION,
      () =>
        isDefined(space?.occupant) &&
        isMinion(space.occupant) &&
        space.occupant.player.equals(player)
    )
    .with(
      SPACE_TARGETING_TYPE.TRAP,
      () => isDefined(space?.occupant) && isTrap(space.occupant)
    )
    .with(
      SPACE_TARGETING_TYPE.ENEMY_TRAP,
      () =>
        isDefined(space?.occupant) &&
        isTrap(space.occupant) &&
        !space.occupant.player.equals(player)
    )
    .with(
      SPACE_TARGETING_TYPE.ALLY_TRAP,
      () =>
        isDefined(space?.occupant) &&
        isTrap(space.occupant) &&
        space.occupant.player.equals(player)
    )
    .exhaustive();
};
