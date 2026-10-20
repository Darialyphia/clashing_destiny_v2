import { INTERACTION_STATES } from '@game/engine/src/game/game.enums';
import { useGameState, useMyPlayer } from './useGameClient';
import type { BoardSpaceViewModel } from '@game/engine/src/client/view-models/board-space.model';

export const useCellTargeting = (cell: Ref<BoardSpaceViewModel>) => {
  const state = useGameState();
  const myPlayer = useMyPlayer();

  const isTargeted = computed(() => {
    const { interaction, effectChain } = state.value;

    if (
      effectChain?.player === myPlayer.value.id &&
      effectChain?.stack.some(effect =>
        effect.targets.spaces.some(spaceId => spaceId === cell.value.id)
      )
    ) {
      return true;
    }
    if (interaction.state !== INTERACTION_STATES.SELECTING_SPACE_ON_BOARD) {
      return false;
    }

    return (
      interaction.ctx.selectedSpaces.some(
        space => space.id === cell.value.id
      ) && interaction.ctx.players.includes(myPlayer.value.id)
    );
  });

  const isTargetable = computed(() => {
    const { interaction } = state.value;
    if (interaction.state !== INTERACTION_STATES.SELECTING_SPACE_ON_BOARD) {
      return false;
    }

    return (
      !isTargeted.value &&
      interaction.ctx.players.includes(myPlayer.value.id) &&
      interaction.ctx.elligibleSpaces.some(space => space.id === cell.value.id)
    );
  });

  return {
    isTargeted,
    isTargetable
  };
};
