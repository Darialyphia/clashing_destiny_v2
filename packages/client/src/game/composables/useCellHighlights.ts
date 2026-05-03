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
    if (!cell.value.card) return false;
    if (cell.value.card.isExhausted) return false;
    if (!ui.value.isInteractivePlayer) return false;
    if (state.value.interaction.state !== INTERACTION_STATES.IDLE) return false;
    if (state.value.phase.state === GAME_PHASES.MAIN) {
      return cell.value.card.canMove;
    }
    if (state.value.phase.state === GAME_PHASES.COMBAT) {
      return cell.value.card.canAttack;
    }

    return false;
  });

  const cannotSelectReason = computed((): string | null => {
    if (!cell.value.card) return null;
    if (!ui.value.isInteractivePlayer) return null;
    if (cell.value.card.isExhausted) return 'Exhausted';
    if (state.value.interaction.state !== INTERACTION_STATES.IDLE)
      return 'An ability is being resolved';
    if (state.value.phase.state === GAME_PHASES.MAIN) {
      if (cell.value.card.kind === CARD_KINDS.HERO) {
        return 'Heroes cannot move !';
      }
      if (cell.value.card.hasSummoningSickness) {
        return 'Minions cannot move the turn they are summoned !';
      }
      if (!cell.value.card.canMove) return 'This card cannot move !';
    }
    if (state.value.phase.state === GAME_PHASES.COMBAT) {
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
