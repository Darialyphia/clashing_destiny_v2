import type { SerializedBoardMinionSlot } from '@game/engine/src/board/board-minion-slot.entity';
import { useGameClient, useGameState } from './useGameClient';
import type { PlayerViewModel } from '@game/engine/src/client/view-models/player.model';
import { INTERACTION_STATES } from '@game/engine/src/game/systems/game-interaction.system';
import { type Ref } from 'vue';

export const useMinionSlot = (slot: Ref<SerializedBoardMinionSlot>) => {
  const state = useGameState();

  const player = computed(() => {
    return state.value.entities[slot.value.playerId] as PlayerViewModel;
  });

  const isHighlighted = computed(() => {
    return (
      state.value.interaction.state ===
        INTERACTION_STATES.SELECTING_MINION_SLOT &&
      state.value.interaction.ctx.elligiblePosition.some(p => {
        return (
          p.playerId === slot.value.playerId &&
          p.slot === slot.value.position &&
          p.zone === slot.value.zone
        );
      })
    );
  });

  return { player, isHighlighted };
};
