import { isDefined, type Point, type Values } from '@game/shared';
import { match } from 'ts-pattern';
import type { Player } from '../player/player.entity';
import type { Game } from '../game/game';
import { isMinion, isTrap } from '../card/card-utils';
import type { BoardSpace } from '../board/board-space.entity';

export type AOEShape = {
  getArea(points: Point[]): BoardSpace[];
};

export const AOE_TARGETING_TYPE = {
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

export type AOETargetingType = Values<typeof AOE_TARGETING_TYPE>;

export const isValidAOETargetingType = (
  game: Game,
  point: Point,
  player: Player,
  type: AOETargetingType
) => {
  const space = game.boardSystem.getSpaceAt(point);

  return !!match(type)
    .with(AOE_TARGETING_TYPE.ANYWHERE, () => true)
    .with(AOE_TARGETING_TYPE.EMPTY, () => !space)
    .with(AOE_TARGETING_TYPE.CARD, () => isDefined(space?.occupant))
    .with(AOE_TARGETING_TYPE.ENEMY_CARD, () => !space?.occupant?.player.equals(player))
    .with(AOE_TARGETING_TYPE.ALLY_CARD, () => space?.occupant?.player.equals(player))
    .with(
      AOE_TARGETING_TYPE.MINION,
      () => isDefined(space?.occupant) && isMinion(space.occupant)
    )
    .with(
      AOE_TARGETING_TYPE.ENEMY_MINION,
      () =>
        isDefined(space?.occupant) &&
        isMinion(space.occupant) &&
        !space.occupant.player.equals(player)
    )
    .with(
      AOE_TARGETING_TYPE.ALLY_MINION,
      () =>
        isDefined(space?.occupant) &&
        isMinion(space.occupant) &&
        space.occupant.player.equals(player)
    )
    .with(
      AOE_TARGETING_TYPE.TRAP,
      () => isDefined(space?.occupant) && isTrap(space.occupant)
    )
    .with(
      AOE_TARGETING_TYPE.ENEMY_TRAP,
      () =>
        isDefined(space?.occupant) &&
        isTrap(space.occupant) &&
        !space.occupant.player.equals(player)
    )
    .with(
      AOE_TARGETING_TYPE.ALLY_TRAP,
      () =>
        isDefined(space?.occupant) &&
        isTrap(space.occupant) &&
        space.occupant.player.equals(player)
    )
    .exhaustive();
};
