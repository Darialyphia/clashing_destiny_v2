import type { BoardCellViewModel } from '@game/engine/src/client/view-models/board-cell.model';
import { FX_EVENTS } from '@game/engine/src/client/controllers/fx-controller';
import { useFxEvent, useGameUi } from './useGameClient';

export const useUnitMoveFx = (cell: BoardCellViewModel) => {
  const ui = useGameUi();
  const isMovingUnit = ref(false);

  useFxEvent(FX_EVENTS.UNIT_AFTER_MOVE, async event => {
    // Source cell: just remove the unit
    if (event.unit === cell.unit?.id) {
      cell.update({
        unit: undefined
      });
    }

    // Destination cell: add unit and animate from old position
    if (event.position.x === cell.x && event.position.y === cell.y) {
      isMovingUnit.value = true;
      // Get the old position before any DOM changes
      const oldElement = ui.value.DOMSelectors.unit(event.unit).element;
      const oldRect = oldElement!.getBoundingClientRect();

      cell.update({
        unit: event.unit
      });

      await nextTick();
      const newElement = ui.value.DOMSelectors.unit(event.unit).element;

      if (newElement) {
        const newRect = newElement.getBoundingClientRect();
        const deltaX = oldRect.left - newRect.left;
        const deltaY = oldRect.top - newRect.top;

        newElement.style.transition = 'none';
        await gsap.fromTo(
          newElement,
          { x: deltaX, y: deltaY },
          {
            x: 0,
            y: 0,
            duration: 0.3,
            ease: Power1.easeInOut
          }
        );
        newElement.style.transition = '';
      }

      isMovingUnit.value = false;
    }
  });

  return {
    isMovingUnit
  };
};
