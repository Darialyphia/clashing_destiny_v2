import { useGameClient, useGameState, useGameUi } from './useGameClient';
import { isDefined, useMouse } from '@vueuse/core';
import { INTERACTION_STATES } from '@game/engine/src/game/game.enums';
import type { BoardSpaceViewModel } from '@game/engine/src/client/view-models/board-space.model';

export const useBoardSpaceArrowPath = (cell: Ref<BoardSpaceViewModel>) => {
  const { client } = useGameClient();
  const ui = useGameUi();
  const state = useGameState();
  const selectedUnitPath = ref('');

  const { x, y } = useMouse();

  const card = computed(() => {
    if (client.value.isPlayingFx) return null;

    const interaction = state.value.interaction;
    if (interaction.state === INTERACTION_STATES.SELECTING_SPACE_ON_BOARD) {
      if (cell.value.card?.id === interaction.ctx.source) {
        return cell.value.card;
      }
    } else if (ui.value.selectedCard) {
      if (cell.value.card?.id === ui.value.selectedCard.id) {
        return ui.value.selectedCard;
      }
    }

    return null;
  });

  const pathColor = computed(() => {
    if (
      state.value.interaction.state ===
      INTERACTION_STATES.SELECTING_SPACE_ON_BOARD
    ) {
      return 'lime';
    }
    return 'red';
  });

  const shouldBeDisplayed = computed(() => isDefined(card.value));

  const computeParabolaPath = () => {
    if (!shouldBeDisplayed.value) return '';
    const cellEl = ui.value.DOMSelectors.boardSpace(cell.value).element;
    if (!cellEl) return '';

    const rect = cellEl.getBoundingClientRect();
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;
    const endX = x.value;
    const endY = y.value;

    // Control point for quadratic bezier - creates a parabola arc
    // Place it above the midpoint to create an upward arc
    const midX = (startX + endX) / 2;
    const distance = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
    const arcHeight = Math.min(distance * 0.4, 150); // Arc height proportional to distance
    const controlY = Math.min(startY, endY) - arcHeight;

    return `M ${startX} ${startY} Q ${midX} ${controlY} ${endX} ${endY}`;
  };

  watch(
    [() => ui.value.selectedCard, x, y],
    () => {
      selectedUnitPath.value = computeParabolaPath();
    },
    { deep: true }
  );

  return {
    selectedUnitPath,
    pathColor
  };
};
