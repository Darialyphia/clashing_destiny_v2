import {
  GAME_PHASES,
  INTERACTION_STATES
} from '@game/engine/src/game/game.enums';
import { useGameState, useGameUi } from './useGameClient';
import type { BoardSpaceViewModel } from '@game/engine/src/client/view-models/board-space.model';

export const useCellHighlights = (cell: Ref<BoardSpaceViewModel>) => {
  const state = useGameState();
  const ui = useGameUi();

  const canMoveTo = computed(() => {
    if (!ui.value.selectedCard) return false;
    return ui.value.selectedCard.canMoveTo(cell.value);
  });

  const canAttack = computed(() => {
    if (!ui.value.selectedCard) return false;
    return ui.value.selectedCard.canAttackAt(cell.value);
  });

  const canSelectUnit = computed(() => {
    if (!cell.value.card) return false;
    if (cell.value.card.isExhausted) return false;
    if (!ui.value.isInteractivePlayer) return false;
    const allowedPhases: string[] = [GAME_PHASES.MAIN, GAME_PHASES.COMBAT];
    if (!allowedPhases.includes(state.value.phase.state)) return false;
    if (state.value.interaction.state !== INTERACTION_STATES.IDLE) return false;
    return true;
  });

  return {
    canMoveTo,
    canAttack,
    canSelectUnit
  };
};
