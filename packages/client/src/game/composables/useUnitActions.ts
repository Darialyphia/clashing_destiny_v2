import type { BoardCellViewModel } from '@game/engine/src/client/view-models/board-cell.model';
import {
  GAME_PHASES,
  INTERACTION_STATES
} from '@game/engine/src/game/game.enums';
import { useGameState, useGameUi } from './useGameClient';

export const useUnitActions = (cell: BoardCellViewModel) => {
  const state = useGameState();
  const ui = useGameUi();

  const canMoveTo = computed(() => {
    if (!ui.value.selectedUnit) return false;
    return ui.value.selectedUnit.canMoveTo(cell);
  });

  const canAttack = computed(() => {
    if (!ui.value.selectedUnit) return false;
    return ui.value.selectedUnit.canAttackAt(cell);
  });

  const canSelectUnit = computed(() => {
    if (!cell.unit) return false;
    if (cell.unit.isExhausted) return false;
    if (!ui.value.isInteractivePlayer) return false;
    if (state.value.phase.state !== GAME_PHASES.MAIN) return false;
    if (state.value.interaction.state !== INTERACTION_STATES.IDLE) return false;
    return true;
  });

  return {
    canMoveTo,
    canAttack,
    canSelectUnit
  };
};
