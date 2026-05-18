import type { ComputedRef } from 'vue';
import { useGameState, useGameUi } from './useGameClient';
import type { BoardSpaceViewModel } from '@game/engine/src/client/view-models/board-space.model';
import { INTERACTION_STATES } from '@game/engine/src/game/game.enums';

const DRAG_THRESHOLD_PX = 30;
const SHAKE_DURATION_MS = 600;
const MESSAGE_DURATION_MS = 2000;

export const useBoardCardDragSelection = (
  cell: Ref<BoardSpaceViewModel>,
  canSelectUnit: ComputedRef<boolean>
) => {
  const ui = useGameUi();
  const state = useGameState();

  let startX = 0;
  let startY = 0;

  const isShaking = ref(false);
  const isShowingMessage = ref(false);
  let shakeTimeout: ReturnType<typeof setTimeout> | null = null;
  let messageTimeout: ReturnType<typeof setTimeout> | null = null;

  const triggerShake = () => {
    if (shakeTimeout) clearTimeout(shakeTimeout);
    if (messageTimeout) clearTimeout(messageTimeout);

    isShaking.value = true;
    isShowingMessage.value = true;

    shakeTimeout = setTimeout(() => {
      isShaking.value = false;
      shakeTimeout = null;
    }, SHAKE_DURATION_MS);

    messageTimeout = setTimeout(() => {
      isShowingMessage.value = false;
      messageTimeout = null;
    }, MESSAGE_DURATION_MS);
  };

  const onMousemove = (e: MouseEvent) => {
    if (!cell.value.occupant) return;
    const deltaY = Math.abs(startY - e.clientY);
    const deltaX = Math.abs(startX - e.clientX);
    if (deltaY >= DRAG_THRESHOLD_PX || deltaX >= DRAG_THRESHOLD_PX) {
      ui.value.select(cell.value.occupant);
      document.body.removeEventListener('mousemove', onMousemove);
    }
  };

  const onMousedown = (e: MouseEvent) => {
    if (cell.value.occupant && !canSelectUnit.value) {
      triggerShake();
      return;
    }
    if (!canSelectUnit.value) return;
    startX = e.clientX;
    startY = e.clientY;

    document.body.addEventListener('mousemove', onMousemove);
  };

  const onMouseup = () => {
    document.body.removeEventListener('mousemove', onMousemove);
  };

  ui.value.onReset(() => {
    document.body.removeEventListener('mousemove', onMousemove);
  });

  return {
    onMousedown,
    onMouseup,
    isShaking: computed(
      () =>
        isShaking.value &&
        state.value.interaction.state === INTERACTION_STATES.IDLE
    ),
    isShowingMessage
  };
};
