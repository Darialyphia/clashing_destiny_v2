import { INTERACTION_STATES } from '@game/engine/src/game/game.enums';
import { useGameState } from './useGameClient';
import type { BoardSpaceViewModel } from '@game/engine/src/client/view-models/board-space.model';

export const useCellTargeting = (cell: Ref<BoardSpaceViewModel>) => {
  const state = useGameState();

  const isTargeted = computed(() => {
    const { interaction } = state.value;
    if (interaction.state !== INTERACTION_STATES.SELECTING_SPACE_ON_BOARD) {
      return false;
    }

    return interaction.ctx.selectedSpaces.some(
      space => space.id === cell.value.id
    );
  });

  const isTargetable = computed(() => {
    const { interaction } = state.value;
    if (interaction.state !== INTERACTION_STATES.SELECTING_SPACE_ON_BOARD) {
      return false;
    }

    return (
      !isTargeted.value &&
      interaction.ctx.elligibleSpaces.some(space => space.id === cell.value.id)
    );
  });

  return {
    isTargeted,
    isTargetable
  };
};
