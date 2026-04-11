import { type Nullable, type Values } from '@game/shared';
import type { Game } from '../game/game';

export const BOARD_ROWS = {
  FRONT: 'front',
  BACK: 'back'
} as const;
export type BoardRow = Values<typeof BOARD_ROWS>;

export type MapBlueprint = {
  id: string;
  rows: number;
  cols: number;
  cells: Array<
    Nullable<
      {
        tile?: string;
      } & ({ player: 'p1' | 'p2'; row: BoardRow } | { player: null })
    >
  >;
  onInit(game: Game): Promise<void>;
};

type CellBlueprint = MapBlueprint['cells'][number];
const p1 = (row: BoardRow): CellBlueprint => ({
  player: 'p1',
  row
});
const p2 = (row: BoardRow): CellBlueprint => ({
  player: 'p2',
  row
});
const neutral: CellBlueprint = {
  player: null
};

export const defaultMap: MapBlueprint = {
  id: 'default-map',
  cols: 5,
  rows: 4,
  // prettier-ignore
  cells: [
    p2(BOARD_ROWS.BACK),p2(BOARD_ROWS.BACK),p2(BOARD_ROWS.BACK),p2(BOARD_ROWS.BACK),p2(BOARD_ROWS.BACK),
    p2(BOARD_ROWS.FRONT),p2(BOARD_ROWS.FRONT),p2(BOARD_ROWS.FRONT),p2(BOARD_ROWS.FRONT),p2(BOARD_ROWS.FRONT),
    p1(BOARD_ROWS.FRONT),p1(BOARD_ROWS.FRONT),p1(BOARD_ROWS.FRONT),p1(BOARD_ROWS.FRONT),p1(BOARD_ROWS.FRONT),
    p1(BOARD_ROWS.BACK),p1(BOARD_ROWS.BACK),p1(BOARD_ROWS.BACK),p1(BOARD_ROWS.BACK),p1(BOARD_ROWS.BACK)
  ],

  async onInit() {}
};
