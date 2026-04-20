import type { BoardCellViewModel } from '@game/engine/src/client/view-models/board-cell.model';
import type { ComputedRef } from 'vue';
import { useGameUi } from './useGameClient';

const DRAG_THRESHOLD_PX = 30;

export const useUnitDragSelection = (
  cell: BoardCellViewModel,
  canSelectUnit: ComputedRef<boolean>
) => {
  const ui = useGameUi();

  let startX = 0;
  let startY = 0;

  const onMousemove = (e: MouseEvent) => {
    if (!cell.unit) return;
    const deltaY = Math.abs(startY - e.clientY);
    const deltaX = Math.abs(startX - e.clientX);
    if (deltaY >= DRAG_THRESHOLD_PX || deltaX >= DRAG_THRESHOLD_PX) {
      ui.value.selectUnit(cell.unit);
      document.body.removeEventListener('mousemove', onMousemove);
    }
  };

  const onMousedown = (e: MouseEvent) => {
    if (!canSelectUnit.value) return;
    startX = e.clientX;
    startY = e.clientY;

    document.body.addEventListener('mousemove', onMousemove);
  };

  const onMouseup = () => {
    document.body.removeEventListener('mousemove', onMousemove);
  };

  return {
    onMousedown,
    onMouseup
  };
};
