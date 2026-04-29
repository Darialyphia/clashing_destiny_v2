import type { Nullable } from '@game/shared';
import type { Game } from '../game/game';
import type { Unit } from '../unit/unit.entity';
import type { Tile } from './tile.entity';

export type TileBlueprint = {
  id: string;
  name: string;
  description: string;
  sprite: {
    id: string;
  };
  onCreated: (game: Game, occupant: Nullable<Unit>, tile: Tile) => Promise<void>;
};
