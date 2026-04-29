import type { Values } from '@game/shared';

export const TILE_EVENTS = {
  TILE_CREATED: 'tile:created',
  TILE_BEFORE_DESTROY: 'tile:before_destroy',
  TILE_AFTER_DESTROY: 'tile:destroy',
  TILE_ENTER: 'tile:enter',
  TILE_LEAVE: 'tile:leave'
} as const;

export type TileEvent = Values<typeof TILE_EVENTS>;
