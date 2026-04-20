import type { BoardCellViewModel } from '@game/engine/src/client/view-models/board-cell.model';
import type { CardViewModel } from '@game/engine/src/client/view-models/card.model';
import {
  GAME_PHASES,
  INTERACTION_STATES
} from '@game/engine/src/game/game.enums';
import { pointToCellId } from '@game/engine/src/board/board-utils';
import { Vec2 } from '@game/shared';
import { useGameState } from './useGameClient';

export const useCellTargeting = (cell: BoardCellViewModel) => {
  const state = useGameState();

  const isTargeted = computed(() => {
    const { interaction, phase } = state.value;
    if (interaction.state !== INTERACTION_STATES.SELECTING_SPACE_ON_BOARD) {
      return false;
    }

    if (
      interaction.ctx.selectedSpaces.some(
        space =>
          pointToCellId(space) ===
          pointToCellId({ x: cell.position.x, y: cell.position.y })
      )
    ) {
      return true;
    }

    if (phase.state === GAME_PHASES.PLAYING_CARD) {
      const card = state.value.entities[phase.ctx.card] as CardViewModel;
      if (!card) return false;
      return card.spacesToHighlight.some(point =>
        Vec2.fromPoint(point).equals({ x: cell.position.x, y: cell.position.y })
      );
    }

    return false;
  });

  const isTargetable = computed(() => {
    const interaction = state.value.interaction;
    if (interaction.state !== INTERACTION_STATES.SELECTING_SPACE_ON_BOARD) {
      return false;
    }

    return (
      !isTargeted.value &&
      interaction.ctx.elligibleSpaces.some(
        spaceId =>
          spaceId === pointToCellId({ x: cell.position.x, y: cell.position.y })
      )
    );
  });

  return {
    isTargeted,
    isTargetable
  };
};
