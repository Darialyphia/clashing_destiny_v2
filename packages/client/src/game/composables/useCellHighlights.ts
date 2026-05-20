import {
  GAME_PHASES,
  INTERACTION_STATES
} from '@game/engine/src/game/game.enums';
import { useGameState, useGameUi } from './useGameClient';
import type { BoardSpaceViewModel } from '@game/engine/src/client/view-models/board-space.model';
import { CARD_KINDS } from '@game/engine/src/card/card.enums';

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
    if (!cell.value.occupant) return false;
    if (cell.value.occupant.isExhausted) return false;
    if (!ui.value.isInteractivePlayer) return false;
    if (state.value.interaction.state !== INTERACTION_STATES.IDLE) return false;
    if (state.value.phase.state === GAME_PHASES.MAIN) {
      return cell.value.occupant.canMove || cell.value.occupant.canAttack;
    }

    return false;
  });

  const cannotSelectReason = computed((): string | null => {
    if (!cell.value.occupant) return null;
    if (!ui.value.isInteractivePlayer) return null;
    if (cell.value.occupant.isExhausted) return 'Exhausted';
    if (state.value.interaction.state !== INTERACTION_STATES.IDLE) return ''; // no need to show reason when in the middle of an interaction
    if (state.value.phase.state === GAME_PHASES.MAIN) {
      if (cell.value.occupant.kind === CARD_KINDS.HERO) {
        return 'Heroes cannot move !';
      }
      if (cell.value.occupant.hasSummoningSickness) {
        return 'Minions cannot move the turn they are summoned !';
      }
      if (!cell.value.occupant.canMove) return 'This card cannot move !';
      if (!cell.value.occupant.canAttack) return 'This card cannot attack !';
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
