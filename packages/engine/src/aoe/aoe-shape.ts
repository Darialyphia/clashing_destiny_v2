import { isDefined, type Values } from '@game/shared';
import { match } from 'ts-pattern';
import type { Player } from '../player/player.entity';
import type { Game } from '../game/game';
import type { BoardSpace } from '../board/board-space.entity';
import type { BoardCoordinates } from '../board/board.system';
import { CARD_KINDS } from '../card/card.enums';

export type AOEShape = {
  getArea(points: BoardCoordinates[]): BoardSpace[];
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

  ARTIFACT: 'artifact',
  ALLY_ARTIFACT: 'ally_artifact',
  ENEMY_ARTIFACT: 'enemy_artifact'
} as const;

export type AOETargetingType = Values<typeof AOE_TARGETING_TYPE>;

export const isValidAOETargetingType = (
  game: Game,
  coords: BoardCoordinates,
  player: Player,
  type: AOETargetingType
) => {
  const space = game.boardSystem.getBoardSpaceAt(coords)!;

  return !!match(type)
    .with(AOE_TARGETING_TYPE.ANYWHERE, () => true)
    .with(AOE_TARGETING_TYPE.EMPTY, () => !space)
    .with(AOE_TARGETING_TYPE.CARD, () => isDefined(space?._card))
    .with(AOE_TARGETING_TYPE.ENEMY_CARD, () => !space?._card?.player.equals(player))
    .with(AOE_TARGETING_TYPE.ALLY_CARD, () => space?._card?.player.equals(player))
    .with(
      AOE_TARGETING_TYPE.MINION,
      () => isDefined(space?._card) && space._card.kind === CARD_KINDS.MINION
    )
    .with(AOE_TARGETING_TYPE.ENEMY_MINION, () => {
      return (
        isDefined(space?._card) &&
        space._card.kind === CARD_KINDS.MINION &&
        !space._card.player.equals(player)
      );
    })
    .with(
      AOE_TARGETING_TYPE.ALLY_MINION,
      () =>
        isDefined(space?._card) &&
        space._card.kind === CARD_KINDS.MINION &&
        space._card.player.equals(player)
    )
    .with(
      AOE_TARGETING_TYPE.ARTIFACT,
      () => isDefined(space?._card) && space._card.kind === CARD_KINDS.ARTIFACT
    )
    .with(
      AOE_TARGETING_TYPE.ENEMY_ARTIFACT,
      () =>
        isDefined(space?._card) &&
        space._card.kind === CARD_KINDS.ARTIFACT &&
        !space._card.player.equals(player)
    )
    .with(
      AOE_TARGETING_TYPE.ALLY_ARTIFACT,
      () =>
        isDefined(space?._card) &&
        space._card.kind === CARD_KINDS.ARTIFACT &&
        space._card.player.equals(player)
    )
    .exhaustive();
};
