import type { BoardCellViewModel } from '@game/engine/src/client/view-models/board-cell.model';
import type { ShallowRef } from 'vue';
import { useGameClient, useGameState, useGameUi } from './useGameClient';
import { isDefined, useMouse } from '@vueuse/core';
import { INTERACTION_STATES } from '@game/engine/src/game/game.enums';

export const useUnitArrowPath = (
  cell: BoardCellViewModel,
  cellEl: Readonly<ShallowRef<HTMLElement | null>>
) => {
  const { client } = useGameClient();
  const ui = useGameUi();
  const state = useGameState();
  const selectedUnitPath = ref('');

  const { x, y } = useMouse();

  const unit = computed(() => {
    if (client.value.isPlayingFx) return null;

    const interaction = state.value.interaction;
    if (interaction.state === INTERACTION_STATES.SELECTING_SPACE_ON_BOARD) {
      if (cell.unit?.card.id === interaction.ctx.source) {
        return cell.unit;
      }
    } else if (ui.value.selectedUnit) {
      if (cell.unit?.id === ui.value.selectedUnit.id) {
        return ui.value.selectedUnit;
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

  const shouldBeDisplatyed = computed(() => isDefined(unit.value));

  const computeParabolaPath = () => {
    if (!shouldBeDisplatyed.value) return '';
    if (!cellEl.value) return '';

    const rect = cellEl.value.getBoundingClientRect();
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
    [() => ui.value.selectedUnit, x, y, () => cell.unit?.card.isUsingAbility],
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
