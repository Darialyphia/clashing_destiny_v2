import { FX_EVENTS } from '@game/engine/src/client/controllers/fx-controller';
import { useFxEvent, useGameUi } from './useGameClient';
import type { BoardSpaceViewModel } from '@game/engine/src/client/view-models/board-space.model';

export const useCardMoveFx = (cell: Ref<BoardSpaceViewModel>) => {
  const ui = useGameUi();
  const isMovingUnit = ref(false);

  useFxEvent(FX_EVENTS.CARD_AFTER_MOVE, async event => {
    // Source cell: just remove the unit
    if (event.card === cell.value.occupant?.id) {
      cell.value.update({
        occupant: undefined
      });
    }

    // Destination cell: add unit and animate from old position
    if (event.to === cell.value.id) {
      isMovingUnit.value = true;
      // Get the old position before any DOM changes
      const oldElement = ui.value.DOMSelectors.cardOnBoard(event.card).element;
      const oldRect = oldElement!.getBoundingClientRect();

      cell.value.update({
        occupant: event.card
      });

      await nextTick();
      const newElement = ui.value.DOMSelectors.cardOnBoard(event.card).element;

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
