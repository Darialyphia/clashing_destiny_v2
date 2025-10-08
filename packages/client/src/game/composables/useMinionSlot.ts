import type { SerializedBoardSlot } from '@game/engine/src/board/board-slot.entity';
import { useGameClient, useGameState } from './useGameClient';
import type { PlayerViewModel } from '@game/engine/src/client/view-models/player.model';
import { INTERACTION_STATES } from '@game/engine/src/game/systems/game-interaction.system';
import { type Ref } from 'vue';

export const useMinionSlot = (slot: Ref<SerializedBoardSlot>) => {
  const state = useGameState();
  const { playerId } = useGameClient();
  const player = computed(() => {
    return state.value.entities[slot.value.playerId] as PlayerViewModel;
  });

  const activePlayerId = computed(() => {
    if (state.value.effectChain) return state.value.effectChain.player;
    return state.value.interaction.ctx.player;
  });

  const isHighlighted = computed(() => {
    return (
      activePlayerId.value === playerId.value &&
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

  const isSelected = computed(() => {
    return (
      state.value.interaction.state ===
        INTERACTION_STATES.SELECTING_MINION_SLOT &&
      state.value.interaction.ctx.selectedPositions.some(p => {
        return (
          p.player === slot.value.playerId &&
          p.slot === slot.value.position &&
          p.zone === slot.value.zone
        );
      })
    );
  });

  return { player, isHighlighted, isSelected };
};
