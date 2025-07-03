import type { SerializedBoardMinionSlot } from '@game/engine/src/board/board-minion-slot.entity';
import { useGameState } from './useGameClient';
import type { PlayerViewModel } from '@game/engine/src/client/view-models/player.model';
import { INTERACTION_STATES } from '@game/engine/src/game/systems/game-interaction.system';
import { type Ref } from 'vue';
import { GAME_PHASES } from '@game/engine/src/game/game.enums';

export const useMinionSlot = (slot: Ref<SerializedBoardMinionSlot>) => {
  const state = useGameState();

  const player = computed(() => {
    return state.value.entities[slot.value.playerId] as PlayerViewModel;
  });

  const isHighlighted = computed(() => {
    return (
      (state.value.phase.state === GAME_PHASES.ATTACK &&
        state.value.phase.ctx.potentialTargets.includes(
          slot.value.minion as string
        )) ||
      (state.value.interaction.state ===
        INTERACTION_STATES.SELECTING_MINION_SLOT &&
        state.value.interaction.ctx.elligiblePosition.some(p => {
          return (
            p.playerId === slot.value.playerId &&
            p.slot === slot.value.position &&
            p.zone === slot.value.zone
          );
        }))
    );
  });

  return { player, isHighlighted };
};
