import {
  COMBAT_STEPS,
  GAME_PHASES,
  INTERACTION_STATES
} from '@game/engine/src/game/game.enums';
import { useGameClient, useGameState, useGameUi } from './useGameClient';
import type { BoardSpaceViewModel } from '@game/engine/src/client/view-models/board-space.model';

export const useCellHighlights = (cell: Ref<BoardSpaceViewModel>) => {
  const state = useGameState();
  const ui = useGameUi();
  const { playerId } = useGameClient();
  const canMoveTo = computed(() => {
    if (!ui.value.selectedCard) return false;
    return ui.value.selectedCard.canMoveTo(cell.value);
  });

  const canAttack = computed(() => {
    if (!ui.value.selectedCard) return false;
    if (!cell.value.card) return false;

    return ui.value.selectedCard.canAttackAt(cell.value.card);
  });

  const canSelectUnit = computed(() => {
    if (!cell.value.card) return false;
    if (cell.value.card.isExhausted) return false;
    if (!ui.value.isInteractivePlayer) return false;
    if (state.value.interaction.state !== INTERACTION_STATES.IDLE) return false;
    if (state.value.phase.state === GAME_PHASES.MAIN) {
      return cell.value.card.canMove || cell.value.card.canAttack;
    }
    if (state.value.effectChain) return false;
    if (state.value.combat.step !== COMBAT_STEPS.DECLARE_ATTACKER) return false;
    if (cell.value.card.player.id !== playerId.value) return false;

    return false;
  });

  const cannotSelectReason = computed((): string | null => {
    if (!cell.value.card) return null;
    if (!ui.value.isInteractivePlayer) return null;
    if (cell.value.card.isExhausted) return 'Card is exhausted';
    if (state.value.interaction.state !== INTERACTION_STATES.IDLE) return ''; // no need to show reason when in the middle of an interaction
    if (state.value.phase.state === GAME_PHASES.MAIN) {
      if (state.value.effectChain) return 'Cannot act during effect chain';
      if (state.value.combat.step !== COMBAT_STEPS.DECLARE_ATTACKER) {
        return 'Cannot act during combat';
      }
      if (!cell.value.card.canMove) return 'This card cannot move !';
      if (!cell.value.card.canAttack) return 'This card cannot attack !';
    }
    return null;
  });

  return {
    canMoveTo,
    canAttack,
    canSelectUnit,
    cannotSelectReason
  };
};
